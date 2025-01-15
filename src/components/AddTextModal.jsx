import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Textarea, Input, Button, Select, SelectItem } from '@nextui-org/react';
import { toast } from 'react-toastify';

const AddTextModal = ({ isOpen, onClose, onSave, element, slides, currentSlideIndex }) => {
  const [text, setText] = useState(element?.text || '');
  const [width, setWidth] = useState(element?.width || 30);
  const [height, setHeight] = useState(element?.height || 10);
  const [fontSize, setFontSize] = useState(element?.fontSize || 1);
  const [color, setColor] = useState(element?.color || '#000000');
  const [fontFamily, setFontFamily] = useState(element?.fontFamily || 'Arial');
  const [x, setX] = useState(element?.x || 0);
  const [y, setY] = useState(element?.y || 0);

  useEffect(() => {
    if (element) {
      setText(element.text || '');
      setWidth(element.width || 30);
      setHeight(element.height || 10);
      setFontSize(element.fontSize || 1);
      setColor(element.color || '#000000');
      setFontFamily(element.fontFamily || 'Arial');
      setX(element.x || 0);
      setY(element.y || 0);
    }
  }, [element]);

  const handleSave = () => {
    const isEditing = !!element?.id;
    const maxZIndex = isEditing
      ? element.zIndex
      : slides[currentSlideIndex]?.content?.elements?.reduce((max, el) => Math.max(max, el.zIndex || 0), 0) + 1;
    const updatedFontFamily = fontFamily || 'Arial';
    const updatedElement = {
      id: isEditing ? element.id : `text-${Date.now()}`,
      type: 'text',
      text,
      width,
      height,
      fontSize,
      color,
      fontFamily: updatedFontFamily,
      x,
      y,
      zIndex: maxZIndex,
    };

    onSave(updatedElement, isEditing);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>{element ? 'Edit Text' : 'Add Text'}</ModalHeader>
        <ModalBody>
          <Textarea
            label="Text Content"
            placeholder="Enter your text here"
            value={text}
            onChange={(e) => setText(e.target.value)}
            minRows={3}
            maxRows={10}
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
            label="Font Size (em)"
            type="number"
            step={0.1}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
          />
          <Input
            label="Text Color (HEX)"
            type="text"
            placeholder="#000000"
            value={color}
            onChange={(e) => {
              const newColor = e.target.value;
              setColor(newColor);
            }}
            onBlur={() => {
              if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
                setColor('#000000');
                toast.error("Invalid color format. Reset to default.");
              }
            }}
          />
          {/* font family select */}
          <Select
            label="Font Family"
            placeholder="Choose font"
            value={fontFamily}
            onChange={(e) => {
              setFontFamily(e.target.value);
            }}
          >
            <SelectItem key="Arial" value="Arial">Arial</SelectItem>
            <SelectItem key="Courier New" value="Courier New">Courier New</SelectItem>
            <SelectItem key="Times New Roman" value="Times New Roman">Times New Roman</SelectItem>
          </Select>
        </ModalBody>
        <ModalFooter>
          <Button color="default" onClick={onClose}>Cancel</Button>
          <Button color="primary" onClick={handleSave}>Save</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddTextModal;