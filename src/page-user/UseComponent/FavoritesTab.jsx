// src/page-user/UseComponent/FavoritesTab.jsx
import React from 'react';
import { useNavigate } from "react-router-dom";
import { Box, Typography, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { FaStar } from 'react-icons/fa';

import { Header } from './Profile';
import { toSlug } from "../UserDashboard";

const FALLBACK_IMAGE_URL = "https://placehold.co/600x400/e2e8f0/64748b?text=TravelSuggest";

const FavoritesTab = ({
    favorites,
    ratings,
    handleRemoveFavorite,
    isLoading,
    userLocation
}) => {
    const navigate = useNavigate();

    const handleCardClick = (item) => {
        const slug = toSlug(item.name); // Sử dụng item.name vì đã có full detail
        navigate(`/location/${item.locationId}/${slug}`, { state: { userLocation } });
    };

    return (
        <Box>
            <Header title="Yêu thích" />
            {isLoading ? (
                <Typography>Đang tải...</Typography>
            ) : Array.isArray(favorites) && favorites.length > 0 ? (
                <div className="suggestions-grid">
                    {favorites.map((item) => (
                        <div
                            key={item.locationId}
                            className="suggestion-card-v2"
                            onClick={() => handleCardClick(item)}
                        >
                            <div className="card-image-container">
                                <img
                                    src={item.images?.[0] || FALLBACK_IMAGE_URL}
                                    alt={item.name}
                                />
                                <div className="card-badge">
                                    {item.categoryNames?.join(", ") || "Chưa có danh mục"}
                                </div>
                            </div>
                            <div className="card-content">
                                <h4 className="card-title">{item.name}</h4>
                                <div className="card-rating">
                                    <FaStar className="star-icon" />
                                    <span>{ratings[item.locationId] ? ratings[item.locationId].toFixed(1) : "Chưa có"}</span>
                                </div>
                                <p className="card-address">
                                    {item.location || "Chưa có địa chỉ"}
                                </p>
                            <IconButton
                            aria-label="delete"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFavorite(item.locationId);
                            }}
                            sx={{
                                position: 'absolute',
                                bottom: { md: 8 },
                                right: {xs:1, md: 8 },
                                top: {xs:1},
                                width: { xs: 28, md: 36 },
                                height: { xs: 28, md: 36 },
                                p: { xs: 0.5, md: 1 },
                                backgroundColor: 'rgba(255,255,255,0.7)',
                                '& svg': {
                                fontSize: { xs: 18, md: 24 }
                                },
                                '&:hover': {
                                backgroundColor: '#fee2e2',
                                color: '#dc2626'
                                }
                            }}
                            >
                            <DeleteIcon />
                            </IconButton>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <Typography sx={{ textAlign: 'center', mt: 4 }}>
                    Bạn chưa có địa điểm yêu thích nào.
                </Typography>
            )}
        </Box>
    );
};

export default FavoritesTab;