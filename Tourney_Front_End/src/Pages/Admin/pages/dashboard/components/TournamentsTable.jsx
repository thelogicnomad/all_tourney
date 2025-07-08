import React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Typography,
  Box,
  Avatar,
  LinearProgress,
  useTheme,
  Stack,
  Button,
  useMediaQuery,
} from "@mui/material";
import {
  SportsSoccer,
  SportsTennis,
  SportsVolleyball,
  Event,
  LocationOn,
  Group,
  AddCircleOutline,
} from "@mui/icons-material";
import { motion } from "framer-motion";

// Sample tournament data (replace with props if needed)
const tournaments = [
  {
    id: 1,
    name: "Summer Badminton Championship 2024",
    status: "pending",
    organizer: "SportsCorp India",
    dates: "2024-07-15 to 2024-07-20",
    location: "Sports Complex, Mumbai",
    events: 8,
    participants: 64,
    sport: "badminton",
    progress: 45,
  },
  {
    id: 2,
    name: "Football League 2024",
    status: "approved",
    organizer: "Elite Sports Club",
    dates: "2024-08-01 to 2024-08-15",
    location: "National Stadium",
    events: 5,
    participants: 120,
    sport: "football",
    progress: 78,
  },
  {
    id: 3,
    name: "Volleyball Premier 2024",
    status: "approved",
    organizer: "Global Sports Network",
    dates: "2024-09-05 to 2024-09-20",
    location: "Olympic Park, Delhi",
    events: 6,
    participants: 96,
    sport: "volleyball",
    progress: 92,
  },
];

// Icon mapping
const sportIcons = {
  football: <SportsSoccer fontSize="medium" />,
  badminton: <SportsTennis fontSize="medium" />,
  volleyball: <SportsVolleyball fontSize="medium" />,
};

// Status chip
function StatusChip({ status }) {
  const theme = useTheme();
  const statusMap = {
    approved: {
      color: "success",
      label: "APPROVED",
    },
    pending: {
      color: "warning",
      label: "PENDING",
    },
  };
  return (
    <Chip
      label={statusMap[status]?.label || status}
      color={statusMap[status]?.color || "default"}
      sx={{
        fontWeight: 600,
        borderRadius: 1,
        px: 1.5,
        letterSpacing: 0.5,
        fontSize: "0.85rem",
      }}
      size="small"
      aria-label={`Status: ${statusMap[status]?.label || status}`}
    />
  );
}

// Progress bar with label
function ProgressWithLabel({ value }) {
  const theme = useTheme();
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Box sx={{ flex: 1 }}>
        <LinearProgress
          variant="determinate"
          value={value}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: theme.palette.grey[200],
            "& .MuiLinearProgress-bar": {
              borderRadius: 4,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            },
          }}
          aria-label={`Progress: ${value}%`}
        />
      </Box>
      <Typography variant="body2" color="text.secondary" minWidth={35}>
        {`${Math.round(value)}%`}
      </Typography>
    </Stack>
  );
}

export default function TournamentsTable({ tournaments: propTournaments }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const data = propTournaments || tournaments;

  // --- MOBILE: Card List ---
  if (isMobile) {
    return (
      <Box>
        {data.map((t) => (
          <Paper key={t.id} sx={{ mb: 2, p: 2 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar
                sx={{
                  bgcolor: theme.palette.primary.main,
                  width: 44,
                  height: 44,
                }}
                aria-label={t.sport}
              >
                {sportIcons[t.sport] || <SportsSoccer />}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {t.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t.organizer}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                  >
                    <Event fontSize="small" /> {t.dates}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                  >
                    <LocationOn fontSize="small" /> {t.location}
                  </Typography>
                </Stack>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mt: 1 }}
                >
                  <Group color="primary" fontSize="small" />
                  <Typography variant="body1" fontWeight={500}>
                    {t.participants}
                  </Typography>
                  <StatusChip status={t.status} />
                </Stack>
                <Box sx={{ mt: 1 }}>
                  <ProgressWithLabel value={t.progress} />
                </Box>
              </Box>
            </Stack>
          </Paper>
        ))}
        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddCircleOutline />}
            sx={{
              fontWeight: 600,
              borderRadius: 2,
              textTransform: "none",
              boxShadow: theme.shadows[2],
            }}
            disableElevation
          >
            Create New Tournament
          </Button>
        </Box>
      </Box>
    );
  }

  // --- DESKTOP: Table ---
  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Paper
          elevation={8}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            maxWidth: 1200,
            mx: "auto",
            width: "100%",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              color: theme.palette.primary.contrastText,
              px: { xs: 2, sm: 4 },
              py: { xs: 3, sm: 4 },
              position: "relative",
            }}
          >
            <Typography variant="h4" fontWeight={700} mb={0.5}>
              Tournament Dashboard
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.88 }}>
              Manage and track all your tournaments
            </Typography>
          </Box>

          {/* Table */}
          <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
            <Table sx={{ minWidth: 700 }} aria-label="Tournaments Table">
              <TableHead>
                <TableRow sx={{ background: theme.palette.grey[100] }}>
                  <TableCell sx={{ fontWeight: 700, width: "30%" }}>
                    Tournament
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    Status
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    Details
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    Participants
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    Progress
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((t) => (
                  <TableRow
                    key={t.id}
                    hover
                    sx={{
                      transition: "background 0.2s",
                      "&:nth-of-type(odd)": {
                        background: theme.palette.action.hover,
                      },
                    }}
                  >
                    {/* Tournament & Organizer */}
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                          sx={{
                            bgcolor: theme.palette.primary.main,
                            width: 44,
                            height: 44,
                          }}
                          aria-label={t.sport}
                        >
                          {sportIcons[t.sport] || <SportsSoccer />}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {t.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", mt: 0.2 }}
                          >
                            {t.organizer}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    {/* Status */}
                    <TableCell align="center">
                      <StatusChip status={t.status} />
                    </TableCell>

                    {/* Details */}
                    <TableCell align="center">
                      <Stack spacing={1} alignItems="center">
                        <Typography
                          variant="body2"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <Event fontSize="small" sx={{ mr: 0.5 }} />
                          {t.dates}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <LocationOn fontSize="small" sx={{ mr: 0.5 }} />
                          {t.location}
                        </Typography>
                      </Stack>
                    </TableCell>

                    {/* Participants */}
                    <TableCell align="center">
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Group color="primary" fontSize="small" />
                        <Typography variant="body1" fontWeight={500}>
                          {t.participants}
                        </Typography>
                      </Stack>
                    </TableCell>

                    {/* Progress */}
                    <TableCell align="center">
                      <ProgressWithLabel value={t.progress} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Footer */}
          <Box
            sx={{
              px: { xs: 2, sm: 4 },
              py: 2,
              borderTop: `1px solid ${theme.palette.divider}`,
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              background: theme.palette.background.paper,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Showing {data.length} of {data.length} tournaments
            </Typography>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddCircleOutline />}
                sx={{
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: "none",
                  boxShadow: theme.shadows[2],
                }}
                disableElevation
              >
                Create New Tournament
              </Button>
            </motion.div>
          </Box>
        </Paper>
      </motion.div>
    </Box>
  );
}
