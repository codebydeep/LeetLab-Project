import { db } from "../libs/db.js";

const createPlaylist = async (req, res) => {
    try {
        const {name, description} = req.body
        
        const userId = req.user.id

        const playlist = await db.playlist.create({
            data: {
                name,
                description,
                userId
            }
        });

        res.status(200).json({
            success: true,
            message: "Playlist created Successfully",
            playlist
        })
    } catch (error) {
        console.error('Error creating playlist: ', error);
        res.status(500).json({
            message: "Failed to created Playlist",
        })
    }
}

const getAllListDetails = async (req, res) => {
    try {
        const playlists = await db.playlist.findMany({
            where: {
                userId: req.user.id
            },
            include: {
                problems: {
                    include: {
                        problem: true
                    }
                }
            }
        })

        res.status(200).json({
            success: true,
            message: "Playlists fetched Successfully",
            playlists
        })

    } catch (error) {
        console.error('Error fetching Playlists: ', error);
        res.status(500).json({
            message: "Failed to fetched Playlists",
        })
    }
}

const getPlaylistDetails = async (req, res) => {
    const {playlistId} = req.params
    
    try {
        const playlist = await db.playlist.findUnique({
            where: {
                id: playlistId,
                userId: req.user.id
            },
            include: {
                problems: {
                    include: {
                        problem: true
                    }
                }
            }
        })

        if(!playlist){
            return res.status(404).json({
                error: "Playlist not found"
            })
        }

        res.status(200).json({
            success: true,
            message: "Playlist fetched Successfully",
            playlist
        })
    } catch (error) {
        console.error('Error fetching playlist: ', error);
        res.status(500).json({
            message: "Failed to fetched Playlist",
        })
    }
}

const addProblemToPlaylist = async (req, res) => {
    const {playlistId} = req.params
    const {problemIds} = req.body

    try {
        if(!Array.isArray(problemIds) || problemIds.length === 0){
            return res.status(400).json({
                error: "Invalid or Missing ProblemsId"
            })
        }

        const problemsInPlaylist = await db.problemsInPlaylist.createMany({
            data: problemIds.map((problemId) => ({
                playlistId,
                problemId,
            }))
        })

        res.status(201).json({
            success: true,
            message: "Problem added to playlist Successfully",
            problemsInPlaylist
        })

    } catch (error) {
        console.error('Error adding Problem in Playlist: ', error);
        res.status(500).json({
            message: "Error adding Problem in Playlist",
        })
    }
}

const deletePlaylist = async (req, res) => {
    const {playlistId} = req.params

    try {
        const deletedPlaylist = await db.playlist.delete({
            where: {
                id: playlistId
            }
        })
        
        res.status(200).json({
            success: true,
            message: "Playlist deleted Successfully",
            deletePlaylist
        })

    } catch (error) {
        console.error('Error Deleting Playlist: ', error);
        res.status(500).json({
            message: "Error Deleting Playlist",
        })
    }
}

const removeProblemFromPlaylist = async (req, res) => {
    const {playlistId} = req.params
    const {problemIds} = req.body

    try {
        if(!Array.isArray(problemIds) || problemIds.length === 0){
            return res.status(400).json({
                error: "Invalid or Missing ProblemsId"
            })
        }

        const deletedProblem = await db.problemsInPlaylist.deleteMany({
            where: {
                playlistId,
                problemId: {
                    in: problemIds
                }
            }
        })

        res.status(200).json({
            success: true,
            message: "Problem removed from Playlist successfully",
            deletedProblem
        })
        
    } catch (error) {
        console.error('Error Removing Problem in Playlist: ', error);
        res.status(500).json({
            message: "Error Removing Problem in Playlist",
        })
    }
}

export {createPlaylist, getAllListDetails, getPlaylistDetails, addProblemToPlaylist, deletePlaylist, removeProblemFromPlaylist}