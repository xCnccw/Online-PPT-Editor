import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Button } from '@nextui-org/react';

const AddCodeModal = ({ isOpen, onClose, onSave, element }) => {
  const [code, setCode] = useState(element?.code || '');
  const [width, setWidth] = useState(element?.width || 80);
  const [height, setHeight] = useState(element?.height || 50);
  const [fontSize, setFontSize] = useState(element?.fontSize || 1);
  const [x, setX] = useState(element?.x || 0);
  const [y, setY] = useState(element?.y || 0);

  useEffect(() => {
    if (element) {
      setCode(element.code || '');
      setWidth(element.width || 80);
      setHeight(element.height || 50);
      setFontSize(element.fontSize || 1);
      setX(element.x || 0);
      setY(element.y || 0);
    }
  }, [element]);

  const handleSave = () => {
    const isEditing = !!element?.id;
    const updatedElement = {
      id: isEditing ? element.id : `code-${Date.now()}`,
      type: 'code',
      code,
      width,
      height,
      fontSize,
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
        <ModalHeader>{element ? 'Edit Code Block' : 'Add Code Block'}</ModalHeader>
        <ModalBody>
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
            label="Font Size (em)"
            type="number"
            step={0.1}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
          />
          <textarea
            className="w-full h-40 p-2 border"
            placeholder="Enter your code here..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
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

export default AddCodeModal;
