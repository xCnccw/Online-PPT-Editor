import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getStore } from '../services/api.js';

export const fetchPresentations = createAsyncThunk(
    'presentation/fetchPresentations',
    async (token, { rejectWithValue }) => {
        try {
            const response = await getStore(token);
            const presentations = response?.presentations || [];
            return presentations;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const loadState = () => {
    try {
        const serializedState = localStorage.getItem('presentations');
        return serializedState ? JSON.parse(serializedState) : [];
    } catch (err) {
        console.error("Failed to load presentations from localStorage:", err);
        return [];
    }
};


const initialState = {
    selectedKey: null,
    presentations: Array.isArray(loadState()) ? loadState() : [],
    sharedPresentations: [], // 新增：存储分享给我的 PPT
    currentPresentationId: null,
    isEditing: false,
    isLoading: false,
    error: null,
    hasFetchedData: false,
    isRearrangeOpen: false, // order modal
};

const presentationSlice = createSlice({
    name: 'presentation',
    initialState,
    reducers: {
        updatePresentation: (state, action) => {
            const updatedPresentation = action.payload;
            const index = state.presentations.findIndex(
                p => p.presentationId === updatedPresentation.presentationId
            );
            if (index !== -1) {
                // 深拷贝以确保状态完全更新
                state.presentations[index] = JSON.parse(JSON.stringify(updatedPresentation));
                // 更新 localStorage
                localStorage.setItem('presentations', JSON.stringify(state.presentations));
            }
        },
        addSlideToPresentation: (state, action) => {
            const { presentationId, slide } = action.payload;
            const presentation = state.presentations.find(p => p.presentationId === presentationId);
            if (presentation) {
                presentation.slides.push(slide);
            }
        },
        setCurrentPresentationId: (state, action) => {
            state.currentPresentationId = action.payload;
            state.isEditing = true;
        },
        exitEditing: (state) => {
            state.currentPresentation = null;
            state.isEditing = false;
        },
        addPresentation: (state, action) => {
            state.presentations.push(action.payload);
            localStorage.setItem('presentations', JSON.stringify(state.presentations));
        },
        addSlide: (state, action) => {
            if (state.currentPresentation) {
                state.currentPresentation.slides.push(action.payload);
            }
        },
        updateSlideContent: (state, action) => {
            const { slideId, content } = action.payload;
            if (state.currentPresentation) {
                const slide = state.currentPresentation.slides.find(s => s.slideId === slideId);
                if (slide) slide.content = content;
            }
        },
        changePresentationTitle: (state, action) => {
            const { presentationId, newTitle } = action.payload;
            const presentation = state.presentations.find(p => p.presentationId === presentationId);
            if (presentation) {
                presentation.title = newTitle;
                localStorage.setItem('presentations', JSON.stringify(state.presentations));
            }
        },
        removePresentation: (state, action) => {
            const presentationId = action.payload;
            state.presentations = state.presentations.filter(p => p.presentationId !== presentationId);
            localStorage.setItem('presentations', JSON.stringify(state.presentations));
        },
        //sidebar select
        setSelectedKey: (state, action) => {
            state.selectedKey = action.payload;
        },
        //update thumbnail
        changePresentationThumbnail: (state, action) => {
            const { presentationId, thumbnail } = action.payload;
            const presentation = state.presentations.find(p => p.presentationId === presentationId);
            if (presentation) {
                presentation.thumbnail = thumbnail;
                localStorage.setItem('presentations', JSON.stringify(state.presentations));
            }
        },
        // delete slide
        removeSlide: (state, action) => {
            const { presentationId, slideId } = action.payload;
            const presentation = state.presentations.find(p => p.presentationId === presentationId);
            if (presentation) {
                presentation.slides = presentation.slides.filter(slide => slide.slideId !== slideId);
                localStorage.setItem('presentations', JSON.stringify(state.presentations));
            }
        },
        // order slide
        reorderSlides: (state, action) => {
            const { presentationId, reorderedSlides } = action.payload;
            const presentation = state.presentations.find(p => p.presentationId === presentationId);
            if (presentation) {
                presentation.slides = reorderedSlides.map((slide, index) => ({
                    ...slide,
                    order: index + 1,
                }));
                localStorage.setItem('presentations', JSON.stringify(state.presentations));
            }
        },
        setRearrangeOpen: (state, action) => {
            state.isRearrangeOpen = action.payload;
        },
        // add element
        addElementToSlide: (state, action) => {
            const { presentationId, slideId, element } = action.payload;
            const presentation = state.presentations.find(p => p.presentationId === presentationId);

            if (!presentation) {
                console.error(`Presentation with ID ${presentationId} not found`);
                return;
            }

            const slide = presentation.slides.find(s => s.slideId === slideId);

            if (!slide) {
                console.error(`Slide with ID ${slideId} not found`);
                return;
            }

            if (!slide.content.elements) {
                slide.content.elements = [];
            }

            slide.content.elements.push(element);
            localStorage.setItem('presentations', JSON.stringify(state.presentations));
        },
        // update element
        updateElementInSlide: (state, action) => {
            const { presentationId, slideId, updatedElement, elementId } = action.payload;
            const presentation = state.presentations.find(p => p.presentationId === presentationId);
            const slide = presentation?.slides.find(s => s.slideId === slideId);

            if (slide && updatedElement === null) {
                // delete
                slide.content.elements = slide.content.elements.filter(el => el.id !== elementId);
            } else if (slide) {
                // update
                slide.content.elements = slide.content.elements.map(el =>
                    el.id === updatedElement.id ? updatedElement : el
                );
            }

            localStorage.setItem('presentations', JSON.stringify(state.presentations));
        },
        // update background
        updateBackgroundInSlide: (state, action) => {
            const { presentationId, slideId, backgroundConfig } = action.payload;
            const presentation = state.presentations.find((p) => p.presentationId === presentationId);
            const slide = presentation?.slides.find((s) => s.slideId === slideId);
            if (slide) {
                slide.background = backgroundConfig.background;
            }
            localStorage.setItem("presentations", JSON.stringify(state.presentations));
        },
        changeSharePPT: (state, action) => {
            const { presentationId, shareUserEmail } = action.payload;
            const presentation = state.presentations.find(p => p.presentationId === presentationId);
            if (presentation) {
                if (!presentation.shareWith) {
                    presentation.shareWith = {};
                }
                presentation.shareWith[shareUserEmail] = {
                    sharedAt: new Date().toISOString(),
                    status: 'active'
                };
                localStorage.setItem('presentations', JSON.stringify(state.presentations));
            }
        },
        resetState: (state) => {
            state.presentations = [];
            state.selectedKey = null;
            state.currentPresentationId = null;
            state.isEditing = false;
            state.hasFetchedData = false;
        },


    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPresentations.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchPresentations.fulfilled, (state, action) => {
                const presentations = action.payload;
                state.presentations = presentations;
                state.isLoading = false;
                state.hasFetchedData = true;
                localStorage.setItem('presentations', JSON.stringify(state.presentations));
            })
            .addCase(fetchPresentations.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});



export const {
    updatePresentation,
    addSlideToPresentation,
    changePresentationThumbnail,
    changePresentationTitle,
    setCurrentPresentationId,
    exitEditing,
    addPresentation,
    addSlide,
    updateSlideContent,
    removePresentation,
    setSelectedKey,
    removeSlide,
    reorderSlides,
    setRearrangeOpen,
    addElementToSlide,
    updateElementInSlide,
    updateBackgroundInSlide,
    resetState,
    changeSharePPT
} = presentationSlice.actions;

export default presentationSlice.reducer;
