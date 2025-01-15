import React, { useState, useEffect } from 'react';
import { useParams,useNavigate,useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Card, CardBody, Button } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import hljs from 'highlight.js/lib/core';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';

const PreviewPage = () => {
    hljs.registerLanguage('javascript', javascript);
    hljs.registerLanguage('python', python);
    hljs.registerLanguage('c', c);
    hljs.registerLanguage('cpp', cpp);

    
    const navigate = useNavigate();
    const { presentationId } = useParams();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const presentation = useSelector((state) =>
        state.presentation.presentations.find(p => p.presentationId === presentationId)
    );
    const slides = presentation?.slides || [];
    const currentSlideIndex = (parseInt(searchParams.get('slide')) || 1) - 1;

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

    // button previous slide
    const goToPreviousSlide = () => {
        if (currentSlideIndex > 0) {
            navigate(`/preview/${presentationId}?slide=${currentSlideIndex}`);
        }
    };

    // button next slide
    const goToNextSlide = () => {
        if (currentSlideIndex < slides.length - 1) {
            navigate(`/preview/${presentationId}?slide=${currentSlideIndex + 2}`);
        }
    };
    // keyboard control
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

    return (
        <div className="flex items-center justify-center flex-1 w-full h-full h-screen overflow-hidden bg-black rounded-none shadow-2xl rad">
            <Card radius="none" shadow="none"
                className=" w-full max-w-full max-h-full aspect-[16/9]"
                style={{
                    background: getSlideBackground(slides[currentSlideIndex]?.background),
                }}
            >
                <CardBody className="relative flex items-center justify-center h-full p-0 overflow-x-hidden overflow-y-hidden">
                    <div className="flex items-center justify-center object-contain w-full h-full ">
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
                                                }}
                                            />
                                        );
                                    case "video":
                                        return (
                                            <div
                                                key={element.id}
                                                className="absolute"
                                                style={{
                                                    top: `${element.y}%`,
                                                    left: `${element.x}%`,
                                                    width: `${element.width}%`,
                                                    height: `${element.height}%`,
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
                                                className="absolute overflow-auto p-1.5 bg-gray-100"
                                                style={{
                                                    top: `${elementCopy.y}%`,
                                                    left: `${elementCopy.x}%`,
                                                    width: `${elementCopy.width}%`,
                                                    height: `${elementCopy.height}%`,
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

                    <Button
                        isIconOnly
                        radius="sm"
                        onClick={goToPreviousSlide}
                        className="absolute transform -translate-y-1/2 text-l bg-black/40 left-[1%] top-1/2 w-[3vw] aspect-square text-[1.5vw]"
                        startContent={<Icon className="text-default-600" icon="material-symbols:arrow-left-rounded" width={50} color="white" />}
                        isDisabled={currentSlideIndex === 0}
                    />
                    <Button
                        isIconOnly
                        radius="sm"
                        onClick={goToNextSlide}
                        startContent={<Icon className="text-default-600" icon="material-symbols:arrow-right-rounded" width={50} color="white" />}
                        className="absolute transform -translate-y-1/2 text-l bg-black/40 right-[1%] top-1/2 w-[3vw] aspect-square text-[1.5vw]"
                        isDisabled={currentSlideIndex === slides.length - 1}
                    />

                    {/* Slide Number */}
                    <div
                        className="absolute bottom-[1%] left-[1%] flex items-center justify-center bg-black/40 rounded text-white w-[4vw] h-[4vw] text-[1.5vw]"
                    >
                        {presentation.slides.length > 1 ? `${currentSlideIndex + 1}` : "1"}
                    </div>
                </CardBody>
            </Card>


        </div>
    );
};
export default PreviewPage;
