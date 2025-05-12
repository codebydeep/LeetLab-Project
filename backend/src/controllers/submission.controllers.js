import {db} from "../libs/db.js";

const getAllSubmission = async (req, res) => {
    try {
        const userId = req.user.id

        const submissions = await db.submission.findMany({
            where: {
                userId: userId
            }
        });

        res.status(200).json({
            success: true,
            error: "Submissions fetched Successfully",
            submissions
        })

    } catch (error) {
        console.error("Fetched Submissions Error: ", error);
        res.status(500).json({
            error: "Failed to fetched submissions"
        })
    }
}

const getSubmissionsForProblem = async (req, res) => {
    try {
        const userId = req.user.id
        const problemId = req.params.problemId
    
        const submissions = await db.submission.findMany({
            where: {
                userId: userId,
                problemId: problemId,
            }
        })

        res.status(200).json({
            success: true,
            error: "Submission fetched Successfully",
            submissions
        })

    } catch (error) {
        console.error("Fetched Submissions Error: ", error);
        res.status(500).json({
            error: "Failed to fetched submissions"
        })
    }
}

const getAllTheSubmissionsForProblem = async (req, res) => {
    try {
        const problemId = req.params.problemId
        
        const submission = await db.submission.count({
            where: {
                problemId: problemId
            }
        });

        res.status(200).json({
            success: true,
            message: "Submission Fetched Successfully",
            count: submission
        })

    } catch (error) {
        console.error("Fetched Submissions Error: ", error);
        res.status(500).json({
            error: "Failed to fetched submissions"
        })
    }
}

export {getAllSubmission, getSubmissionsForProblem, getAllTheSubmissionsForProblem};