import axios from 'axios';
import { socketService } from './socketService';
// const API_URL ="http://localhost:5005"; // 默认本地开发环境
const API_URL =
  typeof import.meta !== "undefined" && import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : typeof window !== "undefined" && window.API_URL
      ? window.API_URL
      : "http://localhost:5005"; // 默认本地开发环境

console.log("📌 API 连接地址:", API_URL);  // 🚀 打印 API 地址，检查是否正确

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true // ✅ 允许带 Cookie 或身份认证
});

export default apiClient;

// register api
export const registerUser = async (userData) => {
  try {
    const response = await apiClient.post('/admin/auth/register', userData, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// login api
export const loginUser = async (userData) => {
  try {
    const response = await apiClient.post('/admin/auth/login', userData);
    localStorage.setItem('user', JSON.stringify({ email: userData.email }));

    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// logout api
export const logoutUser = async (token) => {
  try {
    const response = await apiClient.post('/admin/auth/logout', {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// get data
// export const getStore = async (token) => {
//   try {
//     const response = await apiClient.get('/store', {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     return response.data.store;
//   } catch (error) {
//     console.error('Error fetching store:', error);
//     throw error;
//   }
// };

export const getStore = async (token) => {
  try {
    const response = await apiClient.get('/store/with-shared', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const store = response.data.store;
    const presentations = store.presentations || [];
    console.log(presentations);

    const sharedPresentations = store.sharedPresentations || [];

    return {
      ...store,
      presentations: [...presentations, ...sharedPresentations]
    };
  } catch (error) {
    console.error('Error fetching store:', error);
    throw error;
  }
};

// put data
// export const putStore = async (storeData, token) => {
//   try {
//     const response = await apiClient.put('/store', { store: storeData }, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Error updating store:', error);
//     throw error;
//   }
// };

// 添加更新共享PPT的辅助函数
const updateSharedPresentation = async (presentationId, presentation, token) => {
  console.log('🔄 准备更新共享PPT:', { presentationId, presentation });
  const response = await apiClient.put(`/store/shared/${presentationId}`,
    { presentation },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  console.log('✅ 共享PPT更新成功:', response.data);
  return response.data;
};

// 修改 putStore 函数
// 修改 putStore 函数
export const putStore = async (storeData, token) => {
  try {
    const currentUserEmail = JSON.parse(localStorage.getItem('user'))?.email;
    const updatedPresentations = [...storeData.presentations];

    // 处理共享PPT的更新
    for (let i = 0; i < updatedPresentations.length; i++) {
      const presentation = updatedPresentations[i];

      console.log('📊 处理PPT:', {
        id: presentation.presentationId,
        owner: presentation.ownerEmail,
        currentUser: currentUserEmail,
        isShared: !!presentation.ownerEmail,
        isNotOwner: presentation.ownerEmail !== currentUserEmail
      });

      // 只有非所有者且有ownerEmail的才走共享更新
      if (presentation.ownerEmail && presentation.ownerEmail !== currentUserEmail) {
        console.log('🔄 检测到共享PPT，准备更新');
        try {
          const result = await updateSharedPresentation(
            presentation.presentationId,
            presentation,
            token
          );
          if (!result || !result.presentation) {
            console.error('❌ 共享PPT更新返回数据无效');
            throw new Error('Invalid response data');
          }
          updatedPresentations[i] = {
            ...result.presentation,
            ownerEmail: presentation.ownerEmail
          };
          console.log('✅ 共享PPT更新完成');
        } catch (error) {
          console.error('❌ 更新共享PPT失败:', error);
          // 更新失败时保持原始数据
          return {
            success: false,
            error: '共享PPT更新失败，请稍后重试'
          };
        }
      } else {
        console.log('⏩ 跳过非共享PPT更新');
      }
    }

    // 更新store
    console.log('📝 准备更新本地store');
    const response = await apiClient.put('/store',
      {
        store: {
          ...storeData,
          presentations: updatedPresentations.filter(p =>
            !p.ownerEmail || p.ownerEmail === currentUserEmail
          )
        }
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✅ 本地store更新成功');

    // 在成功更新后发送 WebSocket 通知
    if (storeData.presentations) {
      const presentationId = storeData.presentations[0]?.presentationId;
      if (presentationId) {
        socketService.emitUpdate({
          type: 'content_update',
          presentationId,
          data: storeData.presentations[0],
          updatedBy: currentUserEmail,
          timestamp: new Date().toISOString()
        });
      }
    }

    return {
      ...response.data,
      success: true
    };
  } catch (error) {
    console.error('❌ Store更新失败:', error);
    return {
      success: false,
      error: '更新失败，请稍后重试'
    };
  }
};



// update title
export const updatePresentationTitle = async (presentationId, updatedTitle) => {
  try {
    const token = localStorage.getItem('token');
    const currentStore = await getStore(token);

    const updatedStore = {
      ...currentStore,
      presentations: currentStore.presentations.map(p =>
        p.presentationId === presentationId
          ? { ...p, title: updatedTitle } //  only update title
          : p
      )
    };
    await putStore(updatedStore, token);
    return { success: true };
  } catch (error) {
    console.error("Failed to update presentation title:", error);
    return { success: false, error };
  }
};

// 检查用户是否存在
export const checkUserExists = async (email) => {
  try {
    const response = await apiClient.get(`/admin/auth/check-email/${email}`);
    return response.data;
  } catch (error) {
    console.error('Error checking user:', error);
    throw error;
  }
};

// Share PPT with another user
export const updateSharePPT = async (presentationId, userEmail) => {
  try {
    const token = localStorage.getItem("token");

    // 检查用户存在性
    const userCheck = await checkUserExists(userEmail);
    if (!userCheck.exists) {
      return {
        success: false,
        error: "该邮箱未注册，请确认后重试"
      };
    }

    const currentStore = await getStore(token);
    const updatedStore = {
      ...currentStore,
      presentations: currentStore.presentations.map((p) =>
        p.presentationId === presentationId
          ? {
            ...p,
            shareWith: {
              ...p.shareWith,
              [userEmail]: {
                sharedAt: new Date().toISOString(),
                status: 'active'
              }
            },
          }
          : p
      ),
    };

    await putStore(updatedStore, token);
    return {
      success: true,
      message: "分享成功"
    };
  } catch (error) {
    console.error("❌ Failed to share PPT:", error);
    return {
      success: false,
      error: "分享失败，请稍后重试"
    };
  }
};

// delete presentation
export const deletePresentationById = async (presentationId) => {
  try {
    const token = localStorage.getItem('token');
    const currentStore = await getStore(token);

    const updatedStore = {
      ...currentStore,
      presentations: currentStore.presentations.filter(p => p.presentationId !== presentationId)
    };

    await putStore(updatedStore, token);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete presentation:", error);
    return { success: false, error };
  }
};

// update thumbnail image
export const updatePresentationThumbnail = async (presentationId, thumbnailBase64) => {
  try {
    const token = localStorage.getItem('token');
    const currentStore = await getStore(token);

    const updatedStore = {
      ...currentStore,
      presentations: currentStore.presentations.map(p =>
        p.presentationId === presentationId
          ? { ...p, thumbnail: thumbnailBase64 } // only update thumbnail
          : p
      )
    };
    await putStore(updatedStore, token);
    return { success: true };
  } catch (error) {
    console.error("Failed to update presentation thumbnail:", error);
    return { success: false, error };
  }
};

// addSlide API
export const addSlideAPI = async (presentationId) => {
  try {
    const token = localStorage.getItem('token');
    const currentStore = await getStore(token);
    const currentPresentation = currentStore.presentations.find(p => p.presentationId === presentationId);
    const slides = currentPresentation?.slides || [];

    const newSlide = {
      slideId: `slide-${Date.now()}`,
      content: { elements: [] },
      order: slides.length + 1
    };

    const updatedStore = {
      ...currentStore,
      presentations: currentStore.presentations.map(p =>
        p.presentationId === presentationId
          ? { ...p, slides: [...slides, newSlide] }
          : p
      )
    };

    await putStore(updatedStore, token);
    return { success: true, newSlide };
  } catch (error) {
    console.error("Failed to add slide:", error);
    return { success: false, error };
  }
};

// deleteSlide API
export const removeSlideAPI = async (presentationId, slideId) => {
  try {
    const token = localStorage.getItem('token');
    const currentStore = await getStore(token);

    const updatedPresentations = currentStore.presentations.map((presentation) => {
      if (presentation.presentationId === presentationId) {
        // delete particular slide
        const filteredSlides = presentation.slides.filter((slide) => slide.slideId !== slideId);

        // reorder
        const reorderedSlides = filteredSlides.map((slide, index) => ({
          ...slide,
          order: index + 1,
        }));

        return { ...presentation, slides: reorderedSlides };
      }
      return presentation;
    });

    const updatedStore = { ...currentStore, presentations: updatedPresentations };
    await putStore(updatedStore, token);

    return { success: true };
  } catch (error) {
    console.error("Failed to remove slide:", error);
    return { success: false, error };
  }
};

// order Slide
export const updateSlideOrder = async (presentationId, reorderedSlides) => {
  try {
    const token = localStorage.getItem('token');
    const currentStore = await getStore(token);

    // update slides order
    const updatedStore = {
      ...currentStore,
      presentations: currentStore.presentations.map((presentation) =>
        presentation.presentationId === presentationId
          ? {
            ...presentation,
            slides: reorderedSlides.map((slide, index) => ({
              ...slide,
              order: index + 1,
            })),
          }
          : presentation
      ),
    };

    await putStore(updatedStore, token);
    return { success: true };
  } catch (error) {
    console.error("Failed to update slide order:", error);
    return { success: false, error };
  }
};

// add element
export const addElement = async (presentationId, slideId, newElement) => {
  try {
    const token = localStorage.getItem('token');
    const currentStore = await getStore(token);

    const presentation = currentStore.presentations.find(p => p.presentationId === presentationId);
    const slide = presentation?.slides.find(s => s.slideId === slideId);

    if (!slide) throw new Error("Slide not found");

    if (!slide.content.elements) slide.content.elements = [];

    slide.content.elements.push(newElement);

    const updatedStore = {
      ...currentStore,
      presentations: currentStore.presentations.map(p => p.presentationId === presentationId ? presentation : p),
    };

    await putStore(updatedStore, token);
    return { success: true, newElement };
  } catch (error) {
    console.error("Failed to add element:", error);
    return { success: false, error };
  }
};

// update element
export const updateElementAPI = async (presentationId, slideId, updatedElement) => {
  try {
    const token = localStorage.getItem('token');
    const currentStore = await getStore(token);

    const presentation = currentStore.presentations.find(p => p.presentationId === presentationId);
    const slide = presentation?.slides.find(s => s.slideId === slideId);

    if (!slide) throw new Error("Slide not found");
    slide.content.elements = slide.content.elements.map(el =>
      el.id === updatedElement.id ? updatedElement : el
    );

    const updatedStore = {
      ...currentStore,
      presentations: currentStore.presentations.map(p =>
        p.presentationId === presentationId ? presentation : p
      ),
    };

    await putStore(updatedStore, token);
    return { success: true };
  } catch (error) {
    console.error("Failed to update element:", error);
    return { success: false, error };
  }
};

// update background
export const updateBackgroundAPI = async (presentationId, slideId, backgroundConfig) => {
  try {
    const token = localStorage.getItem("token");
    const currentStore = await getStore(token);

    const presentation = currentStore.presentations.find((p) => p.presentationId === presentationId);
    const slide = presentation?.slides.find((s) => s.slideId === slideId);

    if (!slide) throw new Error("Slide not found");
    // update slide background
    slide.background = backgroundConfig.background;
    const updatedStore = {
      ...currentStore,
      presentations: currentStore.presentations.map((p) =>
        p.presentationId === presentationId ? presentation : p
      ),
    };

    await putStore(updatedStore, token);
    return { success: true };
  } catch (error) {
    console.error("Failed to update background:", error);
    return { success: false, error };
  }
};






