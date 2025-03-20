import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { socketService } from '../services/socketService';
import { useDispatch } from 'react-redux';
import { updatePresentation, fetchPresentations } from '../store/presentationSlice';

const CollaborativeEditor = ({ children }) => {
    const { presentationId } = useParams();
    const dispatch = useDispatch();

    useEffect(() => {
        if (presentationId) {
            socketService.connect(presentationId);
            socketService.setCallbacks({
                onPresentationUpdate: (update) => {
                    if (update.type === 'content_update' && update.data) {
                        console.log('📝 收到更新:', update);
                        // 确保数据结构完整
                        const presentation = update.data;
                        if (presentation.presentationId) {
                            dispatch(updatePresentation(presentation));
                            // 强制重新获取数据
                            const token = localStorage.getItem('token');
                            dispatch(fetchPresentations(token));
                        }
                    }
                }
            });

            return () => socketService.disconnect();
        }
    }, [presentationId, dispatch]);

    return <>{children}</>;
};

export default CollaborativeEditor;