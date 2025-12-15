// src/components/profile/SettingsTab.jsx
import React from 'react';
import { Header } from './Profile';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Switch,
  Select,
  MenuItem,
  Divider
} from "@mui/material";

const SettingsTab = ({
  notificationsEnabled,
  setNotificationsEnabled,
  gpsEnabled,
  setGpsEnabled, 
  language,
  setLanguage,
  handleSaveSettings,
  userRole // <<< ĐÃ THÊM userRole VÀO PROPS
}) => {
    
  const isGpsLocked = true; 
  const shouldShowGps = userRole === "user"; 

  return (
    <Box>
      <Header title="Cài đặt" />
      <List>
        {/* Cài đặt Nhận thông báo */}
        <ListItem>
          <ListItemText primary="Nhận thông báo gợi ý" />
          <Switch
            checked={notificationsEnabled}
            onChange={() => setNotificationsEnabled(!notificationsEnabled)}
          />
        </ListItem>
        <Divider />
        
        {shouldShowGps && (
            <>
                <ListItem>
                  <ListItemText 
                    primary="Cho phép GPS" 
                    secondary={isGpsLocked}
                    sx={{
                      "& .MuiListItemText-primary": { fontWeight: isGpsLocked ? 'bold' : 'normal' },
                      "& .MuiListItemText-secondary": { color: 'orange' }
                    }}
                  />
                  <Switch
                    checked={isGpsLocked ? true : gpsEnabled} 
                    disabled={isGpsLocked} 
                    onChange={() => setGpsEnabled(!gpsEnabled)}
                  />
                </ListItem>
                <Divider />
            </>
        )}
        <ListItem>
          <ListItemText primary="Ngôn ngữ" />
          <Select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            size="small"
            sx={{ ml: 2, minWidth: 120 }}
          >
            <MenuItem value="vi">Tiếng Việt</MenuItem>
            <MenuItem value="en">English</MenuItem>
          </Select>
        </ListItem>
      </List>
      
      <Button
        variant="contained"
        sx={{ mt: 2 }}
        onClick={handleSaveSettings}
      >
        Lưu cài đặt
      </Button>
    </Box>
  );
};

export default SettingsTab;