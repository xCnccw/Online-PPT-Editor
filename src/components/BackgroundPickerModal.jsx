import React, { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Button, Select, SelectItem } from '@nextui-org/react';
import { toast } from 'react-toastify';

const BackgroundPickerModal = ({ isOpen, onClose, onSave, slides, currentSlideIndex }) => {
  const currentBackground = slides[currentSlideIndex]?.background || { type: 'solid', color: '#ffffff' };

  const [backgroundType, setBackgroundType] = useState(currentBackground.type);
  const [color1, setColor1] = useState(currentBackground.color1 || '#ff7e5f');
  const [color2, setColor2] = useState(currentBackground.color2 || '#feb47b');
  const [gradientDirection, setGradientDirection] = useState(currentBackground.gradientDirection || 'to right');
  const [imageUrl, setImageUrl] = useState(currentBackground.imageUrl || '');
  const [uploadedImage, setUploadedImage] = useState(null);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
        setImageUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const updatedBackground = {
      type: backgroundType,
      color1,
      color2,
      gradientDirection,
      imageUrl,
    };

    const updatedElement = {
      ...slides[currentSlideIndex],
      background: updatedBackground,
    };

    onSave(updatedElement, true);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>Choose Background</ModalHeader>
        <ModalBody>
          <Select
            label="Background Type"
            value={backgroundType}
            onChange={(e) => setBackgroundType(e.target.value)}
          >
            <SelectItem key="solid" value="solid">Solid Colour</SelectItem>
            <SelectItem key="gradient" value="gradient">Gradient</SelectItem>
            <SelectItem key="image" value="image">Image</SelectItem>
          </Select>

          {/* Solid Color Picker */}
          {backgroundType === 'solid' && (
            <Input
              label="Solid Colour"
              type="color"
              value={color1}
              onChange={(e) => setColor1(e.target.value)}
            />
          )}

          {/* Gradient Picker */}
          {backgroundType === 'gradient' && (
            <>
              <Input
                label="Gradient Color 1"
                type="color"
                value={color1}
                onChange={(e) => setColor1(e.target.value)}
              />
              <Input
                label="Gradient Color 2"
                type="color"
                value={color2}
                onChange={(e) => setColor2(e.target.value)}
              />
              <Select
                label="Gradient Direction"
                value={gradientDirection}
                onChange={(e) => setGradientDirection(e.target.value)}
              >
                <SelectItem key="to right" value="to right">Left to Right</SelectItem>
                <SelectItem key="to bottom" value="to bottom">Top to Bottom</SelectItem>
                <SelectItem key="to bottom right" value="to bottom right">Diagonal</SelectItem>
              </Select>
            </>
          )}

          {/* Image Picker */}
          {backgroundType === 'image' && (
            <>
              <Input
                label="Upload Image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
              {uploadedImage && (
                <img
                  src={uploadedImage}
                  alt="Preview"
                  className="mt-2 w-full max-h-[200px] object-cover"
                />
              )}
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="default" onClick={onClose}>Cancel</Button>
          <Button color="primary" onClick={handleSave}>Save</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BackgroundPickerModal;
