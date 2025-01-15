import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Button, Checkbox } from '@nextui-org/react';

const AddVideoModal = ({ isOpen, onClose, onSave, element }) => {
    const [videoUrl, setVideoUrl] = useState(element?.url || '');
    const [width, setWidth] = useState(element?.width || 50);
    const [height, setHeight] = useState(element?.height || 30);
    const [autoplay, setAutoplay] = useState(element?.autoplay || false);
    const [x, setX] = useState(element?.x || 0);
    const [y, setY] = useState(element?.y || 0);

    useEffect(() => {
        if (element) {
            setVideoUrl(element.url || '');
            setWidth(element.width || 50);
            setHeight(element.height || 30);
            setAutoplay(element.autoplay || false);
            setX(element.x || 0);
            setY(element.y || 0);
        }
    }, [element]);

    const handleSave = () => {
        const isEditing = !!element?.id;
        const updatedElement = {
            id: isEditing ? element.id : `video-${Date.now()}`,
            type: 'video',
            url: videoUrl,
            width,
            height,
            autoplay: Boolean(autoplay),
            x,
            y,
            zIndex: element?.zIndex || 1,
        };

        // save
        onSave(updatedElement, isEditing);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent>
                <ModalHeader>{element ? 'Edit Video' : 'Add Video'}</ModalHeader>
                <ModalBody>
                    <Input
                        label="Video URL (YouTube Embed)"
                        placeholder="Enter YouTube embed URL"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                    />
                    <Input
                        label="X Position (%)"
                        type="number"
                        min={0}
                        max={100}
                        value={x}
                        onChange={(e) => setX(Number(e.target.value))}
                    />
                    <Input
                        label="Y Position (%)"
                        type="number"
                        min={0}
                        max={100}
                        value={y}
                        onChange={(e) => setY(Number(e.target.value))}
                    />
                    <Input
                        label="Width (%)"
                        type="number"
                        min={0}
                        max={100}
                        value={width}
                        onChange={(e) => setWidth(Number(e.target.value))}
                    />
                    <Input
                        label="Height (%)"
                        type="number"
                        min={0}
                        max={100}
                        value={height}
                        onChange={(e) => setHeight(Number(e.target.value))}
                    />
                    <Checkbox
                        isSelected={autoplay}
                        onChange={() => {
                            setAutoplay((prev) => !prev);
                        }}
                    >
                        Autoplay
                    </Checkbox>
                </ModalBody>
                <ModalFooter>
                    <Button color="default" onClick={onClose}>Cancel</Button>
                    <Button color="primary" onClick={handleSave}>Save</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default AddVideoModal;
