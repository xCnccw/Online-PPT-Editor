import React, { useState,useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Button } from '@nextui-org/react';
import { fileToBase64 } from '../utils/base64';

const AddImageModal = ({ isOpen, onClose, onSave, element }) => {
  const [imageUrl, setImageUrl] = useState(element?.url || '');
  const [width, setWidth] = useState(element?.width || 30);
  const [height, setHeight] = useState(element?.height || 20);
  const [alt, setAlt] = useState(element?.alt || 'Image description');
  const [x, setX] = useState(element?.x || 0);
  const [y, setY] = useState(element?.y || 0);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setImageUrl(base64);
    }
  };

  useEffect(() => {
    if (element) {
      setImageUrl(element.url || '');
      setWidth(element.width || 30);
      setHeight(element.height || 10);
      setX(element.x || 0);
      setY(element.y || 0);
      setAlt(element.alt||'Image description')
    }
  }, [element]);

  const handleSave = () => {
    const isEditing = !!element?.id;
    const updatedElement = {
      id: isEditing ? element.id : `image-${Date.now()}`,
      type: 'image',
      url: imageUrl,
      width,
      height,
      alt,
      x,
      y,
      zIndex: element?.zIndex || 1,
    };
    onSave(updatedElement, isEditing);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>{element ? 'Edit Image' : 'Add Image'}</ModalHeader>
        <ModalBody>
          <Input
            label="Image URL"
            placeholder="Enter image URL or upload file"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          <Input
            type="file"
            accept="image/*"
            aria-label="Upload File"
            onChange={handleFileUpload}
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
          <Input
            label="Alt Text"
            placeholder="Describe the image"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="default" onClick={onClose}>Cancel</Button>
          <Button color="primary" onClick={handleSave}>Save</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddImageModal;
