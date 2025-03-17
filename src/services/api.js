import axios from 'axios';
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
});

export default apiClient;

// register api
export const registerUser = async (userData) => {
  try {
    const response = await apiClient.post('/admin/auth/register', userData);
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
export const getStore = async (token) => {
  try {
    const response = await apiClient.get('/store', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.store;
  } catch (error) {
    console.error('Error fetching store:', error);
    throw error;
  }
};

// put data
export const putStore = async (storeData, token) => {
  try {
    const response = await apiClient.put('/store', { store: storeData }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating store:', error);
    throw error;
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
      content: {elements: []},
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






