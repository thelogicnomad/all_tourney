import React from "react";
import {
  Grid,
  Card,
  Typography,
  Box,
  Stack,
  Container,
  alpha,
} from "@mui/material";
import {
  EmojiEvents as TournamentsIcon,
  Pending as PendingIcon,
  Event as EventsIcon,
  People as ParticipantsIcon,
  TrendingUp,
  TrendingDown,
} from "@mui/icons-material";
import { motion } from "framer-motion";

// Change Indicator (No dots here)
const ChangeIndicator = ({ change }) => {
  if (!change) return null;
  const isPositive = change.startsWith("+");

  return (
    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1 }}>
      {isPositive ? (
        <TrendingUp sx={{ fontSize: 16, color: "#22c55e" }} />
      ) : (
        <TrendingDown sx={{ fontSize: 16, color: "#ef4444" }} />
      )}
      <Typography
        variant="caption"
        sx={{
          color: isPositive ? "#22c55e" : "#ef4444",
          fontWeight: 600,
          fontSize: "0.75rem",
        }}
      >
        {change} vs last week
      </Typography>
    </Stack>
  );
};

// Clean Professional Card (Zero dots)
const CleanCard = ({ title, value, change, icon, accentColor }) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      style={{ width: "100%" }} // Ensure full width
    >
      <Card
        elevation={0}
        sx={{
          height: 160,
          width: "250px",
          borderRadius: 2,
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          position: "relative",
          overflow: "hidden",
          cursor: "pointer",
          transition: "all 0.3s ease",
          // Explicitly remove any dots/pagination styles
          "& .MuiPagination-root": { display: "none" },
          "& .swiper-pagination": { display: "none !important" },
          "& .slick-dots": { display: "none !important" },
          "& [class*='dot']": { display: "none !important" },
          "& [class*='pagination']": { display: "none !important" },
          "&:hover": {
            border: `1px solid ${alpha(accentColor, 0.3)}`,
            boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
            transform: "translateY(-2px)",
          },
          // Remove any pseudo-elements that might create dots
          "&::before, &::after": { display: "none" },
        }}
      >
        {/* Top accent line */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: accentColor,
          }}
        />

        <Box sx={{ p: 3, height: "100%", position: "relative" }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            sx={{ mb: 2 }}
          >
            {/* Icon */}
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                background: alpha(accentColor, 0.08),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s ease",
              }}
            >
              {React.cloneElement(icon, {
                sx: { fontSize: 22, color: accentColor },
              })}
            </Box>

            {/* Title */}
            <Box sx={{ textAlign: "right", flex: 1, ml: 2 }}>
              <Typography
                variant="body2"
                sx={{
                  color: "#64748b",
                  fontWeight: 500,
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                {title}
              </Typography>
            </Box>
          </Stack>

          {/* Value */}
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: "#1e293b",
              fontSize: { xs: "1.8rem", md: "2.2rem" },
              lineHeight: 1.1,
              mb: 0.5,
            }}
          >
            {value}
          </Typography>

          {/* Change Indicator */}
          <ChangeIndicator change={change} />
        </Box>
      </Card>
    </motion.div>
  );
};

// Main Component - ZERO DOTS GUARANTEED
const StatsGrid = ({
  totalTournaments = 0,
  pendingApprovals = 0,
  activeEvents = 0,
  totalParticipants = 0,
}) => {
  const accentColors = {
    tournaments: "#3b82f6",
    pending: "#f59e0b",
    events: "#06b6d4",
    participants: "#10b981",
  };

  const stats = [
    {
      title: "Total Tournaments",
      value: totalTournaments,
      icon: <TournamentsIcon />,
      accentColor: accentColors.tournaments,
    },
    {
      title: "Pending Approvals",
      value: pendingApprovals,
      change: "+6",
      icon: <PendingIcon />,
      accentColor: accentColors.pending,
    },
    {
      title: "Active Events",
      value: activeEvents,
      change: "-2",
      icon: <EventsIcon />,
      accentColor: accentColors.events,
    },
    {
      title: "Total Participants",
      value: totalParticipants.toLocaleString(),
      change: "+120",
      icon: <ParticipantsIcon />,
      accentColor: accentColors.participants,
    },
  ];

  return (
    <Box
      sx={{
        width: "100%",
        // Nuclear option: Kill ALL possible dots
        "& .MuiPagination-root": { display: "none !important" },
        "& .swiper-pagination": { display: "none !important" },
        "& .swiper-pagination-bullet": { display: "none !important" },
        "& .slick-dots": { display: "none !important" },
        "& .slick-dots li": { display: "none !important" },
        "& [class*='dot']": { display: "none !important" },
        "& [class*='pagination']": { display: "none !important" },
        "& [class*='indicator']": { display: "none !important" },
        "& [class*='bullet']": { display: "none !important" },
      }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
        <Grid
          container
          spacing={3}
          sx={{
            // Extra insurance against dots
            "& .MuiGrid-item": {
              "& [class*='dot']": { display: "none !important" },
              "& [class*='pagination']": { display: "none !important" },
            },
          }}
        >
          {stats.map((stat, index) => (
            <Grid
              item
              xs={12}
              sm={6}
              lg={3}
              key={stat.title}
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              sx={{
                // Grid item specific dot removal
                "& [class*='dot']": { display: "none !important" },
                "& [class*='pagination']": { display: "none !important" },
              }}
            >
              <CleanCard {...stat} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default StatsGrid;
