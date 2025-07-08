import Organizer from "../../Models/Organizer/OrganizerModel.js";
import PlayerModel from "../../Models/Player/PlayerModel.js";
import Tournament from "../../Models/Organizer/Tournament.js";
import Event from "../../Models/Organizer/Event.js";

import bcrypt from "bcryptjs";

const adminController = {
  // ==================== ORGANIZER CONTROLLERS ====================

  // Create new organizer
  createOrganizer: async (req, res) => {
    try {
      const { fullName, email, password, tournament, events } = req.body;

      // Check if organizer already exists
      const existingOrganizer = await Organizer.findOne({ email });
      if (existingOrganizer) {
        return res.status(400).json({
          success: false,
          message: "Organizer with this email already exists",
        });
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Generate OTP for verification
      const verifyOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const verifyOtpExpiredAt = Date.now() + 10 * 60 * 1000; // 10 minutes

      // Create organizer
      const organizer = new Organizer({
        fullName,
        email,
        password: hashedPassword,
        tournament,
        events,
        verifyOtp,
        verifyOtpExpiredAt,
      });

      await organizer.save();

      // Remove password from response
      const organizerResponse = organizer.toObject();
      delete organizerResponse.password;

      res.status(201).json({
        success: true,
        message: "Organizer created successfully by admin",
        data: organizerResponse,
        createdBy: req.admin.name,
      });
    } catch (error) {
      console.error("Create organizer error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while creating organizer",
        error: error.message,
      });
    }
  },

  // UPDATED: Get all organizers with admin verification filtering
  getAllOrganizers: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        verified, // Email verification filter
        adminVerified, // NEW: Admin verification filter
        sortBy = "createdAt",
      } = req.query;

      // Build filter object
      let filter = {};

      if (search) {
        filter.$or = [
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }

      // Email verification filter
      if (verified !== undefined) {
        filter.isAccountVerified = verified === "true";
      }

      // NEW: Admin verification filter
      if (adminVerified !== undefined) {
        filter.isVerifiedByAdmin = adminVerified === "true";
      }

      // Build sort object
      const sortOptions = {};
      sortOptions[sortBy] = -1;

      // Execute query with pagination
      const organizers = await Organizer.find(filter)
        .select("-password -verifyOtp")
        .populate("tournament", "name startDate endDate")
        .populate("events", "name category")
        .populate("memberAccess", "fullName email")
        .sort(sortOptions)
        .limit(limit * 1)
        .skip((page - 1) * limit);

      // Get total count for pagination
      const totalOrganizers = await Organizer.countDocuments(filter);

      // NEW: Add verification statistics
      const verificationStats = {
        totalOrganizers,
        emailVerified: await Organizer.countDocuments({
          isAccountVerified: true,
        }),
        adminVerified: await Organizer.countDocuments({
          isVerifiedByAdmin: true,
        }),
        fullyVerified: await Organizer.countDocuments({
          isAccountVerified: true,
          isVerifiedByAdmin: true,
        }),
        pendingEmailVerification: await Organizer.countDocuments({
          isAccountVerified: false,
        }),
        pendingAdminApproval: await Organizer.countDocuments({
          isAccountVerified: true,
          isVerifiedByAdmin: false,
        }),
      };

      res.status(200).json({
        success: true,
        data: organizers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalOrganizers / limit),
          totalItems: totalOrganizers,
          itemsPerPage: parseInt(limit),
        },
        verificationStats, // NEW: Include verification statistics
        accessedBy: req.admin.name,
      });
    } catch (error) {
      console.error("Get organizers error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching organizers",
        error: error.message,
      });
    }
  },

  // Get single organizer by ID
  getOrganizerById: async (req, res) => {
    try {
      const { id } = req.params;

      const organizer = await Organizer.findById(id)
        .select("-password -verifyOtp")
        .populate("tournament", "name startDate endDate location")
        .populate("events", "name category description")
        .populate("memberAccess", "fullName email isAccountVerified");

      if (!organizer) {
        return res.status(404).json({
          success: false,
          message: "Organizer not found",
        });
      }

      res.status(200).json({
        success: true,
        data: organizer,
        accessedBy: req.admin.name,
      });
    } catch (error) {
      console.error("Get organizer by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching organizer",
        error: error.message,
      });
    }
  },

  // UPDATED: Update organizer (now includes isVerifiedByAdmin)
  updateOrganizer: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        fullName,
        email,
        tournament,
        events,
        isAccountVerified,
        isVerifiedByAdmin, // NEW: Can update admin verification
        memberAccess,
      } = req.body;

      // Check if organizer exists
      const organizer = await Organizer.findById(id);
      if (!organizer) {
        return res.status(404).json({
          success: false,
          message: "Organizer not found",
        });
      }

      // Check if email is being updated and if it's already taken
      if (email && email !== organizer.email) {
        const existingOrganizer = await Organizer.findOne({ email });
        if (existingOrganizer) {
          return res.status(400).json({
            success: false,
            message: "Email already in use by another organizer",
          });
        }
      }

      // Update fields
      const updateFields = {};
      if (fullName) updateFields.fullName = fullName;
      if (email) updateFields.email = email;
      if (tournament) updateFields.tournament = tournament;
      if (events) updateFields.events = events;
      if (isAccountVerified !== undefined)
        updateFields.isAccountVerified = isAccountVerified;
      if (isVerifiedByAdmin !== undefined)
        // NEW: Update admin verification
        updateFields.isVerifiedByAdmin = isVerifiedByAdmin;
      if (memberAccess) updateFields.memberAccess = memberAccess;

      const updatedOrganizer = await Organizer.findByIdAndUpdate(
        id,
        updateFields,
        { new: true, runValidators: true }
      )
        .select("-password -verifyOtp")
        .populate("tournament", "name startDate endDate")
        .populate("events", "name category")
        .populate("memberAccess", "fullName email");

      res.status(200).json({
        success: true,
        message: "Organizer updated successfully by admin",
        data: updatedOrganizer,
        updatedBy: req.admin.name,
      });
    } catch (error) {
      console.error("Update organizer error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while updating organizer",
        error: error.message,
      });
    }
  },

  // Delete organizer
  deleteOrganizer: async (req, res) => {
    try {
      const { id } = req.params;

      const organizer = await Organizer.findById(id);
      if (!organizer) {
        return res.status(404).json({
          success: false,
          message: "Organizer not found",
        });
      }

      await Organizer.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: "Organizer deleted successfully by admin",
        deletedBy: req.admin.name,
      });
    } catch (error) {
      console.error("Delete organizer error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while deleting organizer",
        error: error.message,
      });
    }
  },

  // Verify organizer account (Email verification)
  verifyOrganizerAccount: async (req, res) => {
    try {
      const { id } = req.params;
      const { otp } = req.body;

      const organizer = await Organizer.findById(id);
      if (!organizer) {
        return res.status(404).json({
          success: false,
          message: "Organizer not found",
        });
      }

      // Admin can verify without OTP or with OTP
      if (otp) {
        if (organizer.verifyOtp !== otp) {
          return res.status(400).json({
            success: false,
            message: "Invalid OTP",
          });
        }

        if (Date.now() > organizer.verifyOtpExpiredAt) {
          return res.status(400).json({
            success: false,
            message: "OTP has expired",
          });
        }
      }

      // Verify account (Email verification only)
      await Organizer.findByIdAndUpdate(id, {
        isAccountVerified: true,
        verifyOtp: "",
        verifyOtpExpiredAt: 0,
      });

      res.status(200).json({
        success: true,
        message: "Organizer email verified by admin",
        verifiedBy: req.admin.name,
      });
    } catch (error) {
      console.error("Verify organizer account error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while verifying organizer account",
        error: error.message,
      });
    }
  },

  // NEW: Admin approve organizer (set isVerifiedByAdmin to true)
  approveOrganizerByAdmin: async (req, res) => {
    try {
      const { id } = req.params;

      const organizer = await Organizer.findById(id);
      if (!organizer) {
        return res.status(404).json({
          success: false,
          message: "Organizer not found",
        });
      }

      if (organizer.isVerifiedByAdmin) {
        return res.status(400).json({
          success: false,
          message: "Organizer is already approved by admin",
        });
      }

      // Approve organizer by admin
      await Organizer.findByIdAndUpdate(id, {
        isVerifiedByAdmin: true,
      });

      res.status(200).json({
        success: true,
        message: "Organizer approved by admin successfully",
        approvedBy: req.admin.name,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Admin approval error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while approving organizer by admin",
        error: error.message,
      });
    }
  },

  // NEW: Revoke admin approval
  revokeAdminApproval: async (req, res) => {
    try {
      const { id } = req.params;

      const organizer = await Organizer.findById(id);
      if (!organizer) {
        return res.status(404).json({
          success: false,
          message: "Organizer not found",
        });
      }

      if (!organizer.isVerifiedByAdmin) {
        return res.status(400).json({
          success: false,
          message: "Organizer is not approved by admin",
        });
      }

      // Revoke admin approval
      await Organizer.findByIdAndUpdate(id, {
        isVerifiedByAdmin: false,
      });

      res.status(200).json({
        success: true,
        message: "Admin approval revoked successfully",
        revokedBy: req.admin.name,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Revoke admin approval error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while revoking admin approval",
        error: error.message,
      });
    }
  },

  // NEW: Get organizers pending admin approval
  getPendingAdminApprovals: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;

      // Get organizers who are email verified but not admin verified
      const pendingOrganizers = await Organizer.find({
        isAccountVerified: true,
        isVerifiedByAdmin: false,
      })
        .select("-password -verifyOtp")
        .populate("tournament", "name")
        .populate("events", "name")
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const totalPending = await Organizer.countDocuments({
        isAccountVerified: true,
        isVerifiedByAdmin: false,
      });

      res.status(200).json({
        success: true,
        data: pendingOrganizers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalPending / limit),
          totalItems: totalPending,
          itemsPerPage: parseInt(limit),
        },
        message: `${totalPending} organizers pending admin approval`,
        accessedBy: req.admin.name,
      });
    } catch (error) {
      console.error("Get pending admin approvals error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching pending admin approvals",
        error: error.message,
      });
    }
  },

  // ==================== PLAYER CONTROLLERS ====================
  // ... (keeping all existing player controllers unchanged)

  createPlayer: async (req, res) => {
    try {
      const {
        fullName,
        email,
        password,
        phone,
        DateOfBirth,
        aadhaarImage,
        tournament,
        events,
      } = req.body;

      // Check if player already exists with email
      const existingPlayerEmail = await PlayerModel.findOne({ email });
      if (existingPlayerEmail) {
        return res.status(400).json({
          success: false,
          message: "Player with this email already exists",
        });
      }

      // Check if player already exists with phone
      const existingPlayerPhone = await PlayerModel.findOne({ phone });
      if (existingPlayerPhone) {
        return res.status(400).json({
          success: false,
          message: "Player with this phone number already exists",
        });
      }

      // Validate age (minimum 10 years old)
      const birthDate = new Date(DateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      if (age < 10) {
        return res.status(400).json({
          success: false,
          message: "Player must be at least 10 years old",
        });
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create player
      const player = new PlayerModel({
        fullName,
        email,
        password: hashedPassword,
        phone,
        DateOfBirth: birthDate,
        aadhaarImage,
        tournament,
        events,
      });

      await player.save();

      // Remove password from response
      const playerResponse = player.toObject();
      delete playerResponse.password;

      res.status(201).json({
        success: true,
        message: "Player registered successfully by admin",
        data: playerResponse,
        createdBy: req.admin.name,
      });
    } catch (error) {
      console.error("Create player error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while creating player",
        error: error.message,
      });
    }
  },

  getAllPlayers: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        tournament,
        events,
        ageMin,
        ageMax,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      // Build filter object
      let filter = {};

      if (search) {
        filter.$or = [
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ];
      }

      if (tournament) {
        filter.tournament = tournament;
      }

      if (events) {
        filter.events = events;
      }

      // Age filter
      if (ageMin || ageMax) {
        const today = new Date();
        if (ageMax) {
          const minBirthDate = new Date(
            today.getFullYear() - ageMax,
            today.getMonth(),
            today.getDate()
          );
          filter.DateOfBirth = { $gte: minBirthDate };
        }
        if (ageMin) {
          const maxBirthDate = new Date(
            today.getFullYear() - ageMin,
            today.getMonth(),
            today.getDate()
          );
          filter.DateOfBirth = { ...filter.DateOfBirth, $lte: maxBirthDate };
        }
      }

      // Build sort object
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

      // Execute query with pagination
      const players = await PlayerModel.find(filter)
        .select("-password")
        .populate("tournament", "name startDate endDate location category")
        .populate("events", "name category description rules")
        .sort(sortOptions)
        .limit(limit * 1)
        .skip((page - 1) * limit);

      // Get total count for pagination
      const totalPlayers = await PlayerModel.countDocuments(filter);

      // Calculate age for each player
      const playersWithAge = players.map((player) => {
        const playerObj = player.toObject();
        const birthDate = new Date(playerObj.DateOfBirth);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        playerObj.age = age;
        return playerObj;
      });

      res.status(200).json({
        success: true,
        data: playersWithAge,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalPlayers / limit),
          totalItems: totalPlayers,
          itemsPerPage: parseInt(limit),
        },
        accessedBy: req.admin.name,
      });
    } catch (error) {
      console.error("Get players error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching players",
        error: error.message,
      });
    }
  },

  getPlayerById: async (req, res) => {
    try {
      const { id } = req.params;

      const player = await PlayerModel.findById(id)
        .select("-password")
        .populate(
          "tournament",
          "name startDate endDate location category description"
        )
        .populate("events", "name category description rules registrationFee");

      if (!player) {
        return res.status(404).json({
          success: false,
          message: "Player not found",
        });
      }

      // Calculate age
      const playerObj = player.toObject();
      const birthDate = new Date(playerObj.DateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      playerObj.age = age;

      res.status(200).json({
        success: true,
        data: playerObj,
        accessedBy: req.admin.name,
      });
    } catch (error) {
      console.error("Get player by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching player",
        error: error.message,
      });
    }
  },

  updatePlayer: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        fullName,
        email,
        phone,
        DateOfBirth,
        aadhaarImage,
        tournament,
        events,
      } = req.body;

      // Check if player exists
      const player = await PlayerModel.findById(id);
      if (!player) {
        return res.status(404).json({
          success: false,
          message: "Player not found",
        });
      }

      // Check if email is being updated and if it's already taken
      if (email && email !== player.email) {
        const existingPlayerEmail = await PlayerModel.findOne({ email });
        if (existingPlayerEmail) {
          return res.status(400).json({
            success: false,
            message: "Email already in use by another player",
          });
        }
      }

      // Check if phone is being updated and if it's already taken
      if (phone && phone !== player.phone) {
        const existingPlayerPhone = await PlayerModel.findOne({ phone });
        if (existingPlayerPhone) {
          return res.status(400).json({
            success: false,
            message: "Phone number already in use by another player",
          });
        }
      }

      // Validate age if DateOfBirth is being updated
      if (DateOfBirth) {
        const birthDate = new Date(DateOfBirth);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();

        if (age < 10) {
          return res.status(400).json({
            success: false,
            message: "Player must be at least 10 years old",
          });
        }
      }

      // Update fields
      const updateFields = {};
      if (fullName) updateFields.fullName = fullName;
      if (email) updateFields.email = email;
      if (phone) updateFields.phone = phone;
      if (DateOfBirth) updateFields.DateOfBirth = new Date(DateOfBirth);
      if (aadhaarImage) updateFields.aadhaarImage = aadhaarImage;
      if (tournament) updateFields.tournament = tournament;
      if (events) updateFields.events = events;

      const updatedPlayer = await PlayerModel.findByIdAndUpdate(
        id,
        updateFields,
        { new: true, runValidators: true }
      )
        .select("-password")
        .populate("tournament", "name startDate endDate location")
        .populate("events", "name category description");

      res.status(200).json({
        success: true,
        message: "Player updated successfully by admin",
        data: updatedPlayer,
        updatedBy: req.admin.name,
      });
    } catch (error) {
      console.error("Update player error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while updating player",
        error: error.message,
      });
    }
  },

  deletePlayer: async (req, res) => {
    try {
      const { id } = req.params;

      const player = await PlayerModel.findById(id);
      if (!player) {
        return res.status(404).json({
          success: false,
          message: "Player not found",
        });
      }

      await PlayerModel.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: "Player deleted successfully by admin",
        deletedBy: req.admin.name,
      });
    } catch (error) {
      console.error("Delete player error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while deleting player",
        error: error.message,
      });
    }
  },

  getPlayerStats: async (req, res) => {
    try {
      const totalPlayers = await PlayerModel.countDocuments();
      const totalOrganizers = await Organizer.countDocuments();

      // Age distribution
      const ageStats = await PlayerModel.aggregate([
        {
          $addFields: {
            age: {
              $divide: [
                { $subtract: [new Date(), "$DateOfBirth"] },
                365.25 * 24 * 60 * 60 * 1000,
              ],
            },
          },
        },
        {
          $bucket: {
            groupBy: "$age",
            boundaries: [0, 18, 25, 35, 50, 100],
            default: "Other",
            output: {
              count: { $sum: 1 },
            },
          },
        },
      ]);

      // Tournament distribution
      const tournamentStats = await PlayerModel.aggregate([
        {
          $group: {
            _id: "$tournament",
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "tournaments",
            localField: "_id",
            foreignField: "_id",
            as: "tournament",
          },
        },
        {
          $project: {
            tournamentName: { $arrayElemAt: ["$tournament.name", 0] },
            count: 1,
          },
        },
      ]);

      res.status(200).json({
        success: true,
        data: {
          totalPlayers,
          totalOrganizers,
          ageDistribution: ageStats,
          tournamentDistribution: tournamentStats,
        },
        generatedBy: req.admin.name,
      });
    } catch (error) {
      console.error("Get player stats error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching player statistics",
        error: error.message,
      });
    }
  },

  // ==================== DASHBOARD CONTROLLER ====================

  // UPDATED: Admin dashboard overview with new verification metrics
  getDashboardOverview: async (req, res) => {
    try {
      const totalOrganizers = await Organizer.countDocuments();
      const totalPlayers = await PlayerModel.countDocuments();

      // OLD: Basic verification stats
      const verifiedOrganizers = await Organizer.countDocuments({
        isAccountVerified: true,
      });
      const unverifiedOrganizers = await Organizer.countDocuments({
        isAccountVerified: false,
      });

      // NEW: Admin verification stats
      const adminVerifiedOrganizers = await Organizer.countDocuments({
        isVerifiedByAdmin: true,
      });
      const fullyVerifiedOrganizers = await Organizer.countDocuments({
        isAccountVerified: true,
        isVerifiedByAdmin: true,
      });
      const pendingAdminApproval = await Organizer.countDocuments({
        isAccountVerified: true,
        isVerifiedByAdmin: false,
      });

      // Recent registrations (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentOrganizers = await Organizer.countDocuments({
        createdAt: { $gte: sevenDaysAgo },
      });
      const recentPlayers = await PlayerModel.countDocuments({
        createdAt: { $gte: sevenDaysAgo },
      });

      res.status(200).json({
        success: true,
        data: {
          totalOrganizers,
          totalPlayers,
          // OLD: Email verification stats
          verifiedOrganizers,
          unverifiedOrganizers,
          // NEW: Admin verification breakdown
          adminVerifiedOrganizers,
          fullyVerifiedOrganizers,
          pendingAdminApproval,
          // Activity stats
          recentOrganizers,
          recentPlayers,
        },
        accessedBy: req.admin.name,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Get dashboard overview error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching dashboard overview",
        error: error.message,
      });
    }
  },
  getAllTournaments: async (req, res) => {
    try {
      const {
        search,
        isVerified,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      let filter = {};
      if (search) {
        filter.name = { $regex: search, $options: "i" };
      }
      if (isVerified !== undefined) {
        filter.isVerified = isVerified === "true";
      }

      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

      const tournaments = await Tournament.find(filter)
        .populate("organization", "fullName email")
        .populate(
          "events",
          "name eventType matchType maxTeams entryFee allowBooking offers numberOfParticipants"
        )
        .sort(sortOptions);

      res.status(200).json({
        success: true,
        data: tournaments,
        accessedBy: req.admin?.name,
      });
    } catch (error) {
      console.error("Get tournaments error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching tournaments",
        error: error.message,
      });
    }
  },

  // Get single tournament by ID (with details)
  getTournamentById: async (req, res) => {
    try {
      const { id } = req.params;

      const tournament = await Tournament.findById(id)
        .populate("organization", "fullName email")
        .populate(
          "events",
          "name eventType matchType maxTeams entryFee allowBooking offers numberOfParticipants"
        );

      if (!tournament) {
        return res.status(404).json({
          success: false,
          message: "Tournament not found",
        });
      }

      res.status(200).json({
        success: true,
        data: tournament,
        accessedBy: req.admin?.name,
      });
    } catch (error) {
      console.error("Get tournament by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching tournament",
        error: error.message,
      });
    }
  },

  // Approve a tournament (set isVerified: true, optionally update status)
  approveTournament: async (req, res) => {
    try {
      const { id } = req.params;

      const tournament = await Tournament.findById(id);
      if (!tournament) {
        return res.status(404).json({
          success: false,
          message: "Tournament not found",
        });
      }

      if (tournament.isVerified) {
        return res.status(400).json({
          success: false,
          message: "Tournament is already approved",
        });
      }

      tournament.isVerified = true;
      await tournament.save();

      res.status(200).json({
        success: true,
        message: "Tournament approved successfully",
        data: tournament,
        approvedBy: req.admin?.name,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Approve tournament error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while approving tournament",
        error: error.message,
      });
    }
  },

  // Reject a tournament (set isVerified: false, optionally set status to 'cancelled')
  rejectTournament: async (req, res) => {
    try {
      const { id } = req.params;

      const tournament = await Tournament.findById(id);
      if (!tournament) {
        return res.status(404).json({
          success: false,
          message: "Tournament not found",
        });
      }

      if (!tournament.isVerified) {
        return res.status(400).json({
          success: false,
          message: "Tournament is already rejected",
        });
      }

      tournament.isVerified = false;

      await tournament.save();

      res.status(200).json({
        success: true,
        message: "Tournament rejected successfully",
        data: tournament,
        rejectedBy: req.admin?.name,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Reject tournament error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while rejecting tournament",
        error: error.message,
      });
    }
  },

  // Delete a tournament
  deleteTournament: async (req, res) => {
    try {
      const { id } = req.params;

      const tournament = await Tournament.findById(id);
      if (!tournament) {
        return res.status(404).json({
          success: false,
          message: "Tournament not found",
        });
      }

      await Tournament.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: "Tournament deleted successfully",
        deletedBy: req.admin?.name,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Delete tournament error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while deleting tournament",
        error: error.message,
      });
    }
  },
  // ...rest of your controller...
};

export default adminController;
