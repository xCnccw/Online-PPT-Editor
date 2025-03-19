import React, { useEffect, useState } from "react";
import { Card, CardFooter, Image, Button } from "@nextui-org/react";
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentPresentationId } from '../store/presentationSlice';

export default function CardList() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { presentations = [], isLoading, error } = useSelector((state) => state.presentation);
    const selectedKey = useSelector((state) => state.presentation.selectedKey);
    const [sortedPresentations, setSortedPresentations] = useState([]);

    const toEditCard = (presentationId, slide = 1) => {
        dispatch(setCurrentPresentationId(presentationId));
        navigate(`/dashboard/edit/${presentationId}?slide=${slide}`);
    };
    if (error) return <p>Error: {error}</p>;
    // order
    const sortPresentations = () => {
        const sorted = [...presentations];
        switch (selectedKey) {
            case "Newest-first":
                sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case "Oldest-first":
                sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case "A-Z":
                sorted.sort((a, b) => a.title.localeCompare(b.title));
                break;
            default:
                break;
        }
        return sorted;
    };
    // update order
    useEffect(() => {
        const newSortedPresentations = sortPresentations();
        if (JSON.stringify(sortedPresentations) !== JSON.stringify(newSortedPresentations)) {
            setSortedPresentations(newSortedPresentations);
        }
    }, [presentations, selectedKey]);

    return (
        <div className="h-full overflow-y-scroll">
            <div className="grid gap-5 mx-auto md:grid-cols-2 mt-7 lg:grid-cols-4">
                {sortedPresentations.map((item) => (
                    <Card
                        isFooterBlurred
                        className="aspect-[2/1] bg-gray-300"
                        shadow="sm"
                        key={item.presentationId}
                    >
                        <Image
                            alt={item.title}
                            width="100%"
                            height="100%"
                            src={item.thumbnail}
                        />

                        <CardFooter className="justify-between before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
                            <div className="flex flex-col gap-1 max-w-[70%]">
                                <p className="overflow-hidden font-semibold text-tiny text-white/80">
                                    {item.title || ""}
                                </p>
                                <p className="text-tiny text-white/60 line-clamp-2 max-h-[3em] overflow-hidden">
                                {(item.ownerEmail && JSON.parse(localStorage.getItem('user'))?.email !== item.ownerEmail)
                                        ? <span className="font-bold text-transparent text-inherit bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600  sm:block">Shared by: {item.ownerEmail}</span>
                                        : <span className="text-white/60">{item.description || ""}</span>
                                    }
                                </p>
                            </div>
                            <Button
                                className="text-white text-tiny bg-black/20"
                                aria-label="Edit"
                                variant="flat"
                                color="default"
                                radius="lg"
                                size="sm"
                                onClick={() => toEditCard(item.presentationId)}
                            >
                                Enter
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
