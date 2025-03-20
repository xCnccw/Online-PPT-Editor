"use client";

import React, { useState, useEffect } from "react";
import { Avatar, AvatarIcon, Button, ScrollShadow, Spacer, Input, useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { logoutUser } from "../services/api"
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom'
import { sectionItemsForEdit } from "../components/sidebar/sidebar-edit-items.jsx";
import { sectionItemsForList } from "../components/sidebar/sidebar-list-items.jsx";
import SidebarDrawer from "../components/sidebar/sidebar-drawer";
import Sidebar from "../components/sidebar/sidebar";
import { Outlet, useLocation, useParams } from "react-router-dom";
import { getStore, putStore } from '../services/api';
import { addPresentation, fetchPresentations, setSelectedKey, resetState } from '../store/presentationSlice'; // Redux action to add presentation
import { useSelector, useDispatch, } from 'react-redux';
import { fileToBase64 } from '../utils/base64';
import { socketService } from '../services/socketService';

export default function DashboardPage() {
    const location = useLocation();
    const isEditPage = location.pathname.includes("edit");
    const dispatch = useDispatch();
    const { hasFetchedData } = useSelector(state => state.presentation);
    const { presentationId } = useParams();
    const token = localStorage.getItem('token');
    // 在组件内添加状态
    const [onlineUsers, setOnlineUsers] = useState(0);
    useEffect(() => {
        if (token && !hasFetchedData) {
            dispatch(fetchPresentations(token));
        }
    }, [dispatch, hasFetchedData, token]);
    const {
        isOpen: isFirstModalOpen,
        onOpen: openFirstModal,
        onOpenChange
    } = useDisclosure();

    const {
        isOpen: isSecondModalOpen,
        onOpen: openSecondModal,
        onClose: closeSecondModal,
    } = useDisclosure();

    const [backdrop, setBackdrop] = useState('opaque')
    const navigate = useNavigate();
    // logout
    const logOut = async () => {
        try {
            const response = await logoutUser(localStorage.getItem('token'));
            localStorage.removeItem('token')
            localStorage.removeItem('presentations')
            dispatch(resetState());
            toast.success('Log out successful!')
            navigate('/login');
        } catch (error) {
            toast.error("Log out failed. Please try again.")
        }
    };

    const [slidesName, setSlidesName] = useState('');
    const handleInputChange = (event) => {
        setSlidesName(event.target.value);
    };
    const [description, setDescription] = useState("");
    const handleDescriptionChange = (e) => {
        setDescription(e.target.value);
    };

    // new deck button
    const handleOpen = () => {
        setBackdrop('blur')
        openSecondModal();
    }

    // preview button
    const handlePreview = () => {
        const slide = 1;
        const previewUrl = `/preview/${presentationId}?slide=${slide}`;
        window.open(previewUrl, '_blank'); // open new tab page
    };


    const handleClose = () => {
        handleNewDeck(slidesName)
        closeSecondModal()
    }
    // create new deck
    const handleNewDeck = async (slidesName) => {
        const token = localStorage.getItem('token');

        // new presentation data
        const newPresentationData = {
            presentationId: `presentation_${Date.now()}`,
            title: slidesName,
            description: description,
            thumbnail: selectedImage,
            slides: [{ slideId: `slide-${Date.now()}`, order: 1, content: { elements: [] }, }],
            history: [],
            shareWith: {}, // 初始化空的分享列表
            createdAt: Date.now()
        };

        try {
            // get data
            const currentData = await getStore(token);
            const updatedPresentations = currentData.presentations
                ? [...currentData.presentations, newPresentationData]
                : [newPresentationData];

            // update all data
            await putStore({ presentations: updatedPresentations }, token);

            // update Redux store
            dispatch(addPresentation(newPresentationData));
            toast.success('New presentation created successfully!');
        } catch (error) {
            toast.error(`Failed to create new presentation: ${error}`);
            console.error('Failed to create new presentation:', error);
        }
    };
    // upload thumbnail
    const [selectedImage, setSelectedImage] = useState(null);
    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const base64 = await fileToBase64(file);
            setSelectedImage(base64);
        }
    };

    const handleSelect = (key) => {
        dispatch(setSelectedKey(key));
    };

    // 添加 useEffect 监听在线用户
    useEffect(() => {
        if (isEditPage && presentationId) {
            socketService.connect(presentationId);
            socketService.setCallbacks({
                onOnlineUsers: (data) => {
                    setOnlineUsers(data.count || 0);
                }
            });

            return () => socketService.disconnect();
        }
    }, [isEditPage, presentationId]);

    const content = (
        <div className="relative flex flex-col flex-1 h-full p-6 w-72 bg-gradient-to-b from-default-100 via-danger-100 to-secondary-100">
            <div className="flex items-center gap-2 px-2">
                <p className="hidden text-3xl font-bold text-transparent text-inherit bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500 sm:block">
                    Presto
                </p>
                {isEditPage && (
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-pink-100 to-violet-100">
                        <span className="text-lg">👥</span>
                        <span className="text-sm font-medium bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
                            {onlineUsers} online
                        </span>
                    </div>
                )}
            </div>

            <Spacer y={8} />

            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 px-2">
                    <Avatar
                        icon={<AvatarIcon />}
                        classNames={{
                            base: "bg-gradient-to-br from-[#FFB457] to-[#FF705B]",
                            icon: "text-black/80",
                        }}
                    />
                    <div className="flex flex-col">
                        <p className="text-small text-foreground">User</p>
                    </div>
                </div>
                <Button radius="full" className="text-white shadow-lg bg-gradient-to-tr from-pink-500 to-yellow-500" onPress={() => isEditPage ? handlePreview() : handleOpen()}>{isEditPage ? "Preview" : "New deck"}</Button>
            </div>

            <ScrollShadow className="h-full max-h-full py-6 pr-6 -mr-6">
                <Sidebar
                    defaultSelectedKey="home"
                    iconClassName="text-default-600 group-data-[selected=true]:text-foreground"
                    itemClasses={{
                        base: "data-[selected=true]:bg-default-400/20 data-[hover=true]:bg-default-400/10",
                        title: "text-default-600 group-data-[selected=true]:text-foreground",
                    }}
                    items={isEditPage ? sectionItemsForEdit : sectionItemsForList}
                    sectionClasses={{
                        heading: "text-default-600 font-medium",
                    }}
                    onSelect={handleSelect}
                    variant="flat"

                />
            </ScrollShadow>

            <Spacer y={8} />

            <div className="flex flex-col mt-auto">
                <Button
                    color='danger'
                    className="justify-start text-default-600 data-[hover=true]:text-black"
                    startContent={
                        <Icon
                            className="rotate-180 text-default-600"
                            icon="solar:minus-circle-line-duotone"
                            width={24}
                        />
                    }
                    variant="light"
                    onClick={logOut}
                >
                    Log Out
                </Button>
            </div>
        </div>
    );

    return (
        <>
            <div className="flex w-full h-dvh">
                <SidebarDrawer className="flex-none" isOpen={isFirstModalOpen} onOpenChange={onOpenChange}>
                    {content}
                </SidebarDrawer>
                <div className="flex w-full flex-col gap-y-4 p-4 sm:max-w-[calc(100%_-_288px)]">
                    <div className="flex items-center max-w-full gap-2 sm:hidden">
                        <Button
                            isIconOnly
                            className="flex sm:hidden"
                            size="sm"
                            variant="light"
                            onPress={openFirstModal}
                        >
                            <Icon
                                className="text-default-500"
                                height={24}
                                icon="solar:hamburger-menu-outline"
                                width={24}
                            />
                        </Button>
                        <p className="text-3xl font-bold text-transparent text-inherit bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">
                            Presto
                        </p>
                        {isEditPage && (
                            <div className="sm:flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-pink-100 to-violet-100">
                                <span className="text-lg">👥 </span>
                                <span className="text-sm font-medium bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
                                    {onlineUsers} online
                                </span>
                            </div>
                        )}
                    </div>
                    <Outlet />
                </div>
            </div>
            <Modal backdrop={backdrop} isOpen={isSecondModalOpen} onClose={closeSecondModal}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">New deck</ModalHeader>
                            <ModalBody>
                                <Input
                                    autoFocus
                                    label="Slides name"
                                    placeholder="Enter your slides name"
                                    variant="bordered"
                                    onChange={handleInputChange}
                                />
                                <Input
                                    label="Description"
                                    placeholder="Enter a brief description"
                                    variant="bordered"
                                    onChange={handleDescriptionChange}
                                />
                                <h5>Thumbnail Image</h5>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                                {selectedImage && (
                                    <img
                                        src={selectedImage}
                                        alt="Thumbnail Preview"
                                        className="max-w-full mt-5"
                                    />
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Close
                                </Button>
                                <Button color="secondary" onPress={handleClose}>
                                    Create
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}