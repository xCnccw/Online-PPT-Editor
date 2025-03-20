import React, { useState, useEffect } from "react";
import { Button } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'; // 
import { useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Image, Card, CardBody, CardFooter } from "@nextui-org/react";
import { changePresentationTitle, removePresentation, changePresentationThumbnail, setSelectedKey, addSlideToPresentation, removeSlide, setRearrangeOpen, addElementToSlide, updateElementInSlide, updateBackgroundInSlide, setCurrentPresentationId, changeSharePPT } from '../store/presentationSlice';
import { toast } from 'react-toastify';
import { updatePresentationTitle, deletePresentationById, updatePresentationThumbnail, addSlideAPI, removeSlideAPI, addElement, updateElementAPI, updateBackgroundAPI, updateSharePPT } from "../services/api";
import { fileToBase64 } from '../utils/base64';
import RearrangeSlidesModal from "./RearrangeSlidesModal.jsx";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from 'react-dnd';
import { TouchBackend } from 'react-dnd-touch-backend';
import AddTextModal from './AddTextModal.jsx'
import AddImageModal from "./AddImageModal.jsx";
import AddVideoModal from "./AddVIdeoModal.jsx"
import AddCodeModal from './AddCodeModal.jsx';
import CollaborativeEditor from './CollaborativeEditor.jsx'
import DeleteElementModal from './DeleteElementModal';
import BackgroundPickerModal from './BackgroundPickerModal';
// code highlight
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';


export default function EditCard() {
    hljs.registerLanguage('javascript', javascript);
    hljs.registerLanguage('python', python);
    hljs.registerLanguage('c', c);
    hljs.registerLanguage('cpp', cpp);

    const dispatch = useDispatch();
    const { presentationId } = useParams();
    const location = useLocation();
    const isRearrangeOpen = useSelector((state) => state.presentation.isRearrangeOpen);

    // open Re-arrange Modal
    const handleRearrangeClick = () => {
        dispatch(setRearrangeOpen(true));
    };

    // close Re-arrange Modal
    const handleCloseModal = () => {
        dispatch(setRearrangeOpen(false));
    };
    const searchParams = new URLSearchParams(location.search);
    const navigate = useNavigate();

    const selectedKey = useSelector((state) => state.presentation.selectedKey);
    // get current presentation data from redux
    const presentation = useSelector((state) =>
        state.presentation.presentations.find(p => p.presentationId === presentationId)
    );


    const slides = presentation?.slides || [];
    const currentSlideIndex = (parseInt(searchParams.get('slide')) || 1) - 1;

    // button previous slide
    const goToPreviousSlide = () => {
        if (currentSlideIndex > 0) {
            navigate(`/dashboard/edit/${presentationId}?slide=${currentSlideIndex}`);
        }
    };

    // button next slide
    const goToNextSlide = () => {
        if (currentSlideIndex < slides.length - 1) {
            navigate(`/dashboard/edit/${presentationId}?slide=${currentSlideIndex + 2}`);
        }
    };
    // keyboard arrow control
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "ArrowRight") {
                goToNextSlide();
            }
            if (event.key === "ArrowLeft") {
                goToPreviousSlide();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentSlideIndex, slides.length]);

    const currentSlideId = presentation?.slides[currentSlideIndex]?.slideId;
    // delete slide
    const handleDeleteSlide = async () => {
        if (presentation.slides.length === 1) {
            toast.error("Cannot delete the only slide. Please delete the entire presentation.");
            return;
        }
        const result = await removeSlideAPI(presentationId, currentSlideId);

        if (result.success) {
            dispatch(removeSlide({ presentationId, slideId: currentSlideId }));
            toast.success("Slide deleted successfully!");

            // update url， to next or previous slide
            const newSlideIndex = currentSlideIndex === 0 ? 1 : currentSlideIndex;
            navigate(`/dashboard/edit/${presentationId}?slide=${newSlideIndex}`);
        } else {
            toast.error("Failed to delete slide.");
        }
    };



    //model control
    const {
        isOpen: isSecondModalOpen,
        onOpen: openSecondModal,
        onClose: closeSecondModal,
    } = useDisclosure();
    const {
        isOpen: isThirdModalOpen,
        onOpen: openThirdModal,
        onClose: closeThirdModal,
    } = useDisclosure();
    const [backdrop, setBackdrop] = useState('opaque')
    const [modalContent, setModalContent] = useState(null);

    const handleConfirm = () => {
        if (modalContent?.type === "DeleteSlides") {
            deletePresentation();
        } else if (modalContent?.type === "updateTitle") {
            updateTitle();
        } else if (modalContent?.type === "sharePPT") {
            sharePPT();
        }
    };



    // add text
    const handleAddText = () => {
        setSelectedElement(null);
        setIsTextModalOpen(true);
    };
    // add image
    const handleAddImage = () => {
        setSelectedElement(null);
        setIsImageModalOpen(true);
    };
    // add video
    const handleAddVideo = () => {
        setSelectedElement(null);
        setIsVideoModalOpen(true);
    };
    // add code
    const handleAddCode = () => {
        setSelectedElement(null);
        setIsCodeModalOpen(true);
    }
    // change background
    const handleBackground = () => {
        setSelectedElement(null);
        setIsBackgroundModalOpen(true);
    }

    const [selectedElement, setSelectedElement] = useState(null);
    const [isTextModalOpen, setIsTextModalOpen] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
    const [isBackgroundModalOpen, setIsBackgroundModalOpen] = useState(false);

    const handleEditText = (element) => {
        setSelectedElement(element);
        setSelectedElementId(element.id);
        setIsTextModalOpen(true);
    };

    const handleEditImage = (element) => {
        setSelectedElement(element);
        setIsImageModalOpen(true);
    };

    const handleEditVideo = (element) => {
        setSelectedElement(element);
        setIsVideoModalOpen(true);
    };

    const handleEditCode = (element) => {
        setSelectedElement(element);
        setIsCodeModalOpen(true);
    };


    // update element
    const handleSaveElement = async (updatedElement, isEditing) => {
        try {
            const result = isEditing
                ? await updateElementAPI(presentationId, currentSlideId, updatedElement)
                : await addElement(presentationId, currentSlideId, updatedElement);

            if (result.success) {
                if (isEditing) {
                    dispatch(updateElementInSlide({ presentationId, slideId: currentSlideId, updatedElement }));
                    toast.success("Element updated successfully!");
                } else {
                    dispatch(addElementToSlide({ presentationId, slideId: currentSlideId, element: result.newElement }));
                    toast.success("Element added successfully!");
                }
            } else {
                toast.error("Failed to save element.");
            }
        } catch (error) {
            console.error("Error saving element:", error);
            toast.error("An error occurred while saving element.");
        }
    };

    // update background
    const handleSaveBackground = async (backgroundConfig) => {
        const result = await updateBackgroundAPI(presentationId, currentSlideId, backgroundConfig);

        if (result.success) {
            dispatch(updateBackgroundInSlide({
                presentationId,
                slideId: currentSlideId,
                backgroundConfig,
            }));
            toast.success("Background updated successfully!");
        } else {
            toast.error("Failed to update background.");
        }
    };

    const [selectedElementId, setSelectedElementId] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [elementToDelete, setElementToDelete] = useState(null);

    // delete element Modal
    const handleRightClick = (elementId) => {
        setElementToDelete(elementId);
        setIsDeleteModalOpen(true);
    };

    // delete element
    const handleDeleteElement = async () => {
        try {
            const elementId = elementToDelete;
            // update Redux Store
            dispatch(updateElementInSlide({
                presentationId,
                slideId: currentSlideId,
                updatedElement: null,
                elementId,
            }));

            const result = await updateElementAPI(presentationId, currentSlideId, {
                id: elementId,
                deleted: true,
            });

            if (result.success) {
                toast.success("Element deleted successfully!");
            } else {
                toast.error("Failed to delete element.");
            }
        } catch (error) {
            console.error("Error deleting element:", error);
            toast.error("An error occurred while deleting element.");
        } finally {
            setIsDeleteModalOpen(false);
            setElementToDelete(null);
        }
    };

    // sidebar select
    useEffect(() => {
        if (selectedKey) {
            switch (selectedKey) {
                case "Text":
                    handleAddText(currentSlideId);
                    break;
                case "Image":
                    handleAddImage(currentSlideId);
                    break;
                case "Video":
                    handleAddVideo(currentSlideId);
                    break;
                case "Code":
                    handleAddCode(currentSlideId);
                    break;
                case "Change-background":
                    handleBackground();
                    break;
                case "Change-thumbnail":
                    changeThumbnail();
                    break;
                case "History":
                    // handleShowHistory();
                    break;
                default:
                    break;
            }
            dispatch(setSelectedKey(null));
        }
    }, [selectedKey, dispatch]);

    // back card list
    const backHome = () => {
        navigate('/dashboard');
    }


    // delete Modal
    const openDeleteConfirmation = () => {
        setModalContent({
            type: "DeleteSlides",
            title: "Are you sure?",
            body: "Do you really want to delete this presentation?",
            confirmButtonLabel: "Yes",
            cancelButtonLabel: "No"
        });
        openSecondModal();
    };
    // delete presentation
    const deletePresentation = async () => {
        try {
            const result = await deletePresentationById(presentationId);
            if (result.success) {
                toast.success("Presentation deleted successfully");
                closeSecondModal();
                dispatch(removePresentation(presentationId));
                dispatch(setCurrentPresentationId(null));
                navigate('/dashboard');
            } else {
                throw new Error("Failed to delete presentation");
            }
        } catch (error) {
            toast.error("Failed to delete presentation");
            console.error("Error deleting presentation:", error);
        }
    };

    // update title
    const [updatedTitle, setUpdatedTitle] = useState("");
    const openEditTitleModal = () => {
        setModalContent({
            type: "updateTitle",
            title: "Edit Title",
            body: (
                <Input
                    autoFocus
                    label="Slides name"
                    placeholder="New slides name"
                    variant="bordered"
                    onChange={(e) => setUpdatedTitle(e.target.value)}
                />
            ),
            confirmButtonLabel: "Update",
            cancelButtonLabel: "Cancel"
        });
        openSecondModal();
    };

    const [shareUserEmail, setShareUserEmail] = useState("");
    const openShareModal = () => {
        setModalContent({
            type: "sharePPT",
            title: "Share PPT",
            body: (
                <Input
                    autoFocus
                    label="User Email"
                    placeholder="New User Email"
                    variant="bordered"
                    onChange={(e) => setShareUserEmail(e.target.value)}
                />
            ),
            confirmButtonLabel: "Confirm",
            cancelButtonLabel: "Cancel"
        });
        openSecondModal();
    };


    const updateTitle = async () => {
        try {
            const result = await updatePresentationTitle(presentationId, updatedTitle);

            if (result.success) {
                dispatch(changePresentationTitle({ presentationId, newTitle: updatedTitle }));

                toast.success("Title updated successfully!");
                closeSecondModal();
            } else {
                throw result.error;
            }
        } catch (error) {
            toast.error("Failed to update title");
            console.error("Error updating title:", error);
        }
    }

    //change thumbnail
    const changeThumbnail = () => {
        openThirdModal()
    }

    const sharePPT = async () => {
        try {
            const result = await updateSharePPT(presentationId, shareUserEmail);

            if (result.success) {
                dispatch(changeSharePPT({ presentationId, shareUserEmail: shareUserEmail }));

                toast.success("Share PPT successfully!");
                closeSecondModal();
            } else {
                throw result.error;
            }
        } catch (error) {
            toast.error("Failed to share PPT");
            console.error("Error share PPT:", error);
        }
    }

    const [selectedImage, setSelectedImage] = useState(null);
    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const base64 = await fileToBase64(file);
            setSelectedImage(base64);
        }
    };
    const handleSaveThumbnail = async () => {
        if (!selectedImage) {
            toast.error("Please upload an image first!");
            return;
        }

        try {
            const result = await updatePresentationThumbnail(presentationId, selectedImage);
            if (result.success) {
                // update Redux store thumbnail
                dispatch(changePresentationThumbnail({ presentationId, thumbnail: selectedImage }));
                toast.success("Thumbnail updated successfully!");
                closeThirdModal();
            } else {
                throw new Error("Failed to update thumbnail.");
            }
        } catch (error) {
            toast.error("Failed to update thumbnail.");
            console.error("Error updating thumbnail:", error);
        }
    };

    // add slide
    const addSlide = async () => {
        const result = await addSlideAPI(presentationId);
        if (result.success) {
            dispatch(addSlideToPresentation({ presentationId, slide: result.newSlide }));
            toast.success("Slide added successfully!");
        }
    };


    //  for youtube autoplay 
    useEffect(() => {
        if (!window.YT) {
            // loading YouTube IFrame API
            const tag = document.createElement("script");
            tag.src = "https://www.youtube.com/iframe_api";
            tag.async = true;
            document.body.appendChild(tag);
        }
    }, []);
    const initializePlayer = (elementId) => {
        if (window.YT && window.YT.Player) {
            const player = new YT.Player(`youtube-player-${elementId}`, {
                events: {
                    onReady: (event) => {
                        event.target.playVideo();
                    },
                },
            });
        }
    };

    const getSlideBackground = (background) => {
        if (!background) return "#ffffff"; // default white background

        const { type, color1, color2, gradientDirection, imageUrl } = background;

        switch (type) {
            case "solid":
                return color1 || "#ffffff";
            case "gradient":
                return `linear-gradient(${gradientDirection || "to right"}, ${color1}, ${color2})`;
            case "image":
                return `url(${imageUrl}) no-repeat center center / cover`;
            default:
                return "#ffffff";
        }
    };






    // dynamic choose which drug function   web/mobile
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const backend = isTouchDevice ? TouchBackend : HTML5Backend;
    return <>
        <CollaborativeEditor>
            <div className="items-center justify-between h-16 gap-2 px-4 py-2 max-w-fullflex min-h-16 rounded-medium border-small border-divider">
                <div className="flex items-center max-w-full gap-2 ">
                    <Button
                        onClick={backHome}
                        color="default" variant="flat" startContent=<Icon className="text-default-600" icon="solar:backspace-line-duotone" width={24} />>
                        <span className="hidden sm:block">Back</span>
                    </Button>
                    <h2 className="mx-5 overflow-hidden text-xl font-semibold whitespace-nowrap text-ellipsis">{presentation ? presentation.title : ''}</h2>
                    <Button aria-label="edit-title-button" isIconOnly onClick={openEditTitleModal} variant="faded" startContent=<Icon className="text-default-600" icon="solar:pen-2-line-duotone" width={24} />>
                    </Button>
                    <Button aria-label="edit-title-button" isIconOnly onClick={openShareModal} variant="flat" color="success" startContent=<Icon className="text-default-600" icon="fluent:share-24-regular" width={24} />>
                    </Button>


                    <Button onClick={openDeleteConfirmation} aria-label="Delete presentation" className="" color="danger" variant="flat" startContent=<Icon className="text-default-600" icon="solar:trash-bin-2-line-duotone" width={24} />>
                        <span className="inline-flex items-center">
                            <span className="hidden sm:block">Delete</span>
                            <span className="hidden ml-1 md:block">presentation</span>
                        </span>
                    </Button>
                </div>
            </div>

            <div className="flex items-center justify-center h-16 gap-2 px-4 py-2 max-w-fullflex min-h-16 rounded-medium border-small border-divider">
                <div className="flex items-center max-w-full gap-2 ">
                    <Button
                        size="sm"
                        onClick={addSlide}
                        color="success" variant="flat" startContent=<Icon className="text-default-600" icon="material-symbols:add-ad-outline-rounded" width={20} />>
                        <span className="hidden sm:block">Add slide</span>
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleDeleteSlide}
                        color="danger" variant="flat" startContent=<Icon className="text-default-600" icon="material-symbols:contract-delete-outline-rounded" width={20} />>
                        <span className="hidden sm:block">Delete slide</span>
                    </Button>
                    {slides.length > 1 && (
                        <>
                            <Button
                                size="sm"
                                isIconOnly
                                variant="ghost"
                                aria-label="Previous Slide"
                                startContent={<Icon className="text-default-600" icon="material-symbols:arrow-left-alt-rounded" width={24} />}
                                onClick={goToPreviousSlide}
                                isDisabled={currentSlideIndex === 0}
                            />
                            <Button
                                size="sm"
                                isIconOnly
                                variant="ghost"
                                aria-label="Next Slide"
                                startContent={<Icon className="text-default-600" icon="material-symbols:arrow-right-alt-rounded" width={24} />}
                                onClick={goToNextSlide}
                                isDisabled={currentSlideIndex === slides.length - 1}
                            />

                            <Button
                                size="sm"
                                onClick={handleRearrangeClick} className="" color="warning" variant="flat" startContent=<Icon className="text-default-600" icon="streamline:ascending-number-order" width={20} />>
                                <span className="inline-flex items-center">
                                    <span className="hidden sm:block">Order</span>
                                    <span className="hidden ml-1 md:block">silde</span>
                                </span>
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-center flex-1 w-full h-full p-5 overflow-x-hidden overflow-y-hidden rounded-lg shadow-2xl">
                <Card radius="none" shadow="none"
                    className=" w-full max-w-full max-h-full aspect-[16/9]"
                    style={{
                        background: getSlideBackground(slides[currentSlideIndex]?.background),
                    }}
                >
                    <CardBody className="relative flex items-center justify-center h-full p-0 overflow-x-hidden overflow-y-hidden">
                        <div className="flex items-center justify-center object-contain w-full h-full border-2">
                            {slides[currentSlideIndex]?.content?.elements
                                ?.filter((element) => !element.deleted)?.length === 0 && (
                                    <p className="text-gray-500">Slide Content Area</p>
                                )}
                            {slides[currentSlideIndex]?.content?.elements
                                ?.filter((element) => !element.deleted) // filter IsDeleted element
                                .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
                                .map((element) => {
                                    switch (element.type) {
                                        case "text":
                                            return (
                                                <div
                                                    key={element.id}
                                                    className="absolute overflow-hidden text-left break-words whitespace-pre-wrap"
                                                    style={{
                                                        top: `${element.y}%`,
                                                        left: `${element.x}%`,
                                                        width: `${element.width}%`,
                                                        height: `${element.height}%`,
                                                        fontSize: `${element.fontSize}em`,
                                                        fontFamily: element.fontFamily || "Arial",
                                                        color: element.color,
                                                        border: element.id === selectedElementId ? "2px solid #ccc" : "1px solid #eaeaea",
                                                    }}
                                                    onClick={() => setSelectedElementId(element.id)}
                                                    onDoubleClick={() => handleEditText(element)}
                                                    onContextMenu={(e) => {
                                                        e.preventDefault();
                                                        handleRightClick(element.id);
                                                    }}
                                                >
                                                    {element.text}
                                                </div>
                                            );

                                        case "image":
                                            return (
                                                <img
                                                    key={element.id}
                                                    src={element.url}
                                                    alt={element.alt}
                                                    className="absolute object-cover"
                                                    style={{
                                                        top: `${element.y}%`,
                                                        left: `${element.x}%`,
                                                        width: `${element.width}%`,
                                                        height: `${element.height}%`,
                                                        border: element.id === selectedElementId ? "2px solid #ccc" : "1px solid #eaeaea",
                                                    }}
                                                    onClick={() => setSelectedElementId(element.id)}
                                                    onDoubleClick={() => handleEditImage(element)}
                                                    onContextMenu={(e) => {
                                                        e.preventDefault();
                                                        handleRightClick(element.id);
                                                    }}
                                                />
                                            );
                                        case "video":
                                            return (
                                                <div
                                                    key={element.id}
                                                    className={`absolute cursor-pointer ${element.id === selectedElementId ? 'border-4 border-blue-500' : 'border-4 border-gray-300'}`}
                                                    style={{
                                                        top: `${element.y}%`,
                                                        left: `${element.x}%`,
                                                        width: `${element.width}%`,
                                                        height: `${element.height}%`,
                                                    }}

                                                    onDoubleClick={() => handleEditVideo(element)}
                                                    onContextMenu={(e) => {
                                                        e.preventDefault();
                                                        handleRightClick(element.id);
                                                    }}
                                                >
                                                    <iframe
                                                        id={`youtube-player-${element.id}`}
                                                        src={`${element.url}${element.autoplay ? '?autoplay=1&enablejsapi=1' : '?enablejsapi=1'}`}
                                                        className="w-full h-full"
                                                        frameBorder="0"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                        onLoad={() => initializePlayer(element.id)}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />

                                                </div>
                                            );
                                        case "code":
                                            const elementCopy = { ...element }; // shallow copy
                                            const result = hljs.highlightAuto(elementCopy.code || '');
                                            elementCopy.language = result.language || 'plaintext';

                                            return (
                                                <div
                                                    key={elementCopy.id}
                                                    className={`overflow-auto p-1.5 bg-gray-100 absolute ${elementCopy.id === selectedElementId ? 'border-2 solid #ccc' : 'border-1 border-gray-300'} cursor-pointer`}
                                                    style={{
                                                        top: `${elementCopy.y}%`,
                                                        left: `${elementCopy.x}%`,
                                                        width: `${elementCopy.width}%`,
                                                        height: `${elementCopy.height}%`,
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedElementId(elementCopy.id);
                                                    }}
                                                    onDoubleClick={() => handleEditCode(elementCopy)}
                                                    onContextMenu={(e) => {
                                                        e.preventDefault();
                                                        handleRightClick(element.id);
                                                    }}
                                                >
                                                    {/* Detected Language */}
                                                    <p className="mb-2 text-sm text-gray-600">Detected Language: {elementCopy.language}</p>

                                                    {/* highlight code */}
                                                    <SyntaxHighlighter language={elementCopy.language} style={atomDark} showLineNumbers>
                                                        {elementCopy.code}
                                                    </SyntaxHighlighter>
                                                </div>
                                            );



                                        default:
                                            return null;
                                    }
                                })}
                        </div>

                        {/* Slide Number */}
                        <div
                            aria-label="Slide Number"
                            className="w-[4vw] h-[4vw] text-[1.5vw] absolute bottom-[1%] left-[1%] flex items-center justify-center bg-black/40 rounded text-white"
                        >
                            {presentation?.slides.length > 1 ? `${currentSlideIndex + 1}` : "1"}
                        </div>
                    </CardBody>
                </Card>


            </div>




            <Modal backdrop={backdrop} isOpen={isSecondModalOpen} onClose={closeSecondModal}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">{modalContent?.title}</ModalHeader>
                            <ModalBody>
                                {typeof modalContent?.body === "string" ? (
                                    <p>{modalContent.body}</p>
                                ) : (
                                    modalContent.body
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button color="default" variant="ghost" onPress={onClose}>
                                    {modalContent?.cancelButtonLabel || "Cancel"}
                                </Button>
                                <Button color="danger" onPress={handleConfirm}>
                                    {modalContent?.confirmButtonLabel || "Confirm"}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            <Modal isOpen={isThirdModalOpen} onClose={closeThirdModal}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalBody>
                                <h3>Upload Thumbnail Image</h3>
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
                                <Button color="default" variant="ghost" onPress={closeThirdModal}>Cancel</Button>
                                <Button
                                    color="danger"
                                    onPress={handleSaveThumbnail}
                                >
                                    Save
                                </Button>
                            </ModalFooter>

                        </>
                    )}
                </ModalContent>
            </Modal>


            {/* render RearrangeSlidesModal */}
            {isRearrangeOpen && (

                <DndProvider backend={backend} options={isTouchDevice ? { enableMouseEvents: true } : {}}>
                    <RearrangeSlidesModal
                        presentationId={presentationId}
                        isOpen={isRearrangeOpen}
                        onClose={handleCloseModal}
                    />
                </DndProvider>
            )}
            <AddTextModal
                isOpen={isTextModalOpen}
                slides={slides}
                currentSlideIndex={currentSlideIndex}
                onClose={() => setIsTextModalOpen(false)}
                element={selectedElement}
                onSave={handleSaveElement}
            />

            <AddImageModal
                isOpen={isImageModalOpen}
                onClose={() => setIsImageModalOpen(false)}
                element={selectedElement}
                onSave={handleSaveElement}
            />

            <AddVideoModal
                isOpen={isVideoModalOpen}
                onClose={() => setIsVideoModalOpen(false)}
                element={selectedElement}
                onSave={handleSaveElement}
            />

            <AddCodeModal
                isOpen={isCodeModalOpen}
                onClose={() => setIsCodeModalOpen(false)}
                element={selectedElement}
                onSave={handleSaveElement}
            />

            <DeleteElementModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onDelete={handleDeleteElement}
            />

            <BackgroundPickerModal
                isOpen={isBackgroundModalOpen}
                onClose={() => setIsBackgroundModalOpen(false)}
                onSave={handleSaveBackground}
                slides={slides}
                currentSlideIndex={currentSlideIndex}
            />
        </CollaborativeEditor>
    </>
}