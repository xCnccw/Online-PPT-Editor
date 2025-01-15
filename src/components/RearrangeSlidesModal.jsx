import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { reorderSlides } from '../store/presentationSlice';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { TouchBackend } from 'react-dnd-touch-backend';
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";
import { updateSlideOrder } from '../services/api'
import { toast } from 'react-toastify';

const RearrangeSlidesModal = ({ presentationId, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const slides = useSelector((state) =>
    state.presentation.presentations.find(p => p.presentationId === presentationId)?.slides || []
  );

  const [reorderedSlides, setReorderedSlides] = useState(slides);

  const handleDragEnd = (fromIndex, toIndex) => {
    const updatedSlides = [...reorderedSlides];
    const [movedSlide] = updatedSlides.splice(fromIndex, 1);
    updatedSlides.splice(toIndex, 0, movedSlide);
    setReorderedSlides(updatedSlides);
  };

  const handleSaveOrder = async () => {
    try {
      //  API updae slide order
      const result = await updateSlideOrder(presentationId, reorderedSlides);
      if (result.success) {
        dispatch(reorderSlides({ presentationId, reorderedSlides }));
        toast.success("Slide order updated successfully!");
        onClose();
      } else {
        toast.error("Failed to update slide order.");
      }
    } catch (error) {
      console.error("Error updating slide order:", error);
      toast.error("An error occurred while updating slide order.");
    }
  };

  return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Order Slides</ModalHeader>

          <ModalBody>
            <div className="grid grid-cols-4 gap-4">
              {reorderedSlides.map((slide, index) => (
                <DraggableSlide
                  key={slide.slideId}
                  index={index}
                  slide={slide}
                  originalIndex={slides.findIndex(s => s.slideId === slide.slideId)}
                  onDragEnd={handleDragEnd}
                />
              ))}
            </div>
          </ModalBody>

          <ModalFooter>
            <Button color="default" variant="ghost" onPress={onClose}>Cancel</Button>
            <Button color="danger" onPress={handleSaveOrder}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
  );
};

const DraggableSlide = ({ slide, index, originalIndex, onDragEnd }) => {
  const [{ isDragging }, ref] = useDrag({
    type: 'SLIDE',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'SLIDE',
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        onDragEnd(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => ref(drop(node))}
      className={`relative flex items-center justify-center w-full h-auto aspect-[4/3] rounded-lg shadow-md ${isDragging ? 'bg-blue-300 scale-105' : 'bg-gray-200'
        }`}
    >
      <p className="text-xl font-bold">{originalIndex + 1}</p>
    </div>
  );
};

export default RearrangeSlidesModal;
