import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";

const DeleteElementModal = ({ isOpen, onClose, onDelete }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>Confirm Deletion</ModalHeader>
        <ModalBody>
          <p>Are you sure you want to delete this element?</p>
        </ModalBody>
        <ModalFooter>
          <Button color="default" variant="ghost" onPress={onClose}>
            Cancel
          </Button>
          <Button color="danger" onPress={onDelete}>
            Delete
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeleteElementModal;
