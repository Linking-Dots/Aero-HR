import React, {useState} from "react";
import {
    Box,
    CircularProgress,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    Typography
} from "@mui/material";
import ClearIcon from '@mui/icons-material/Clear';
import {useTheme} from "@mui/material/styles";
import LoadingButton from "@mui/lab/LoadingButton";
import {toast} from "react-toastify";
import GlassDialog from "@/Components/GlassDialog.jsx";
import {Clear, CloudUpload, Description, InsertDriveFile, PictureAsPdf, Upload} from '@mui/icons-material';
import {useDropzone} from 'react-dropzone';


const DailyWorkUploadForm = ({ open, closeModal, setTotalRows, setData }) => {
    const [file, setFile] = useState(null);
    const [processing, setProcessing] = useState(false);
    const theme = useTheme();

    const onFileChange = (acceptedFiles) => {
        setFile(acceptedFiles[0]);

    };

    const clearFile = () => {
        setFile(null);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: onFileChange,
        noClick: !!file,
        noKeyboard: !!file,
    });

    const getFileIcon = (file) => {
        if (!file) return <CloudUpload fontSize="large" />;
        const fileType = file.type;

        if (fileType.startsWith('image/')) {
            return <Image fontSize="large" />;
        } else if (fileType === 'application/pdf') {
            return <PictureAsPdf fontSize="large" />;
        } else if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            return <Description fontSize="large" />; // Excel icon
        } else {
            return <InsertDriveFile fontSize="large" />;
        }
    };



    const handleSubmit = async (event) => {
        event.preventDefault();
        setProcessing(true);

        const formData = new FormData();
        formData.append('file', file);


        const promise = new Promise(async (resolve, reject) => {
            try {
                const response = await axios.post(route('dailyWorks.import'), formData);

                console.log(response)

                if (response.status === 200) {
                    setData(response.data.data); // Set the imported data
                    setTotalRows(response.data.total); // Set the total rows if needed
                    resolve(response.data.message || 'Daily works imported successfully.');
                    closeModal(); // Close the modal after a successful upload
                }
            } catch (error) {
                console.log(error.response)
                console.log(error.response.data.errors)
                reject(`Error: ${error.message || 'An unexpected error occurred.'}`);
            } finally {
                setProcessing(false);
            }
        });

        toast.promise(
            promise,
            {
                pending: {
                    render() {
                        return (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <CircularProgress />
                                <span style={{ marginLeft: '8px' }}>Uploading file ...</span>
                            </div>
                        );
                    },
                    icon: false,
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        backgroundColor: theme.glassCard.backgroundColor,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary
                    }
                },
                success: {
                    render({ data }) {
                        return <>{data}</>;
                    },
                    icon: '🟢',
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        backgroundColor: theme.glassCard.backgroundColor,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary
                    }
                },
                error: {
                    render({ data }) {
                        return <>{data}</>;
                    },
                    icon: '🔴',
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        backgroundColor: theme.glassCard.backgroundColor,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary
                    }
                }
            }
        );
    };

    return (
        <GlassDialog open={open} onClose={closeModal}>
            <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
                <Typography>Import Daily Works</Typography>
                <IconButton
                    variant="outlined"
                    color="primary"
                    onClick={closeModal}
                    sx={{ position: 'absolute', top: 8, right: 16, zIndex: 0}}
                >
                    <ClearIcon />
                </IconButton>
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Box
                                {...getRootProps()}
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '2px dashed #ccc',
                                    borderRadius: '8px',
                                    padding: '20px',
                                    cursor: file ? 'not-allowed' : 'pointer',
                                    '&:hover': {
                                        borderColor: file ? '#ccc' : '#aaa',
                                    },
                                }}
                            >
                                <input {...getInputProps()} />
                                <IconButton
                                    sx={{
                                        borderRadius: '50%',
                                        backgroundColor: '#f0f0f0',
                                        '&:hover': {
                                            backgroundColor: file ? '#f0f0f0' : '#e0e0e0',
                                            cursor: file ? 'not-allowed' : 'pointer',
                                        },
                                    }}
                                    disabled={!!file}
                                >
                                    {getFileIcon(file)}
                                </IconButton>
                                {file ? (
                                    <>
                                        <Typography variant="body1" sx={{ marginTop: '10px' }}>
                                            {file.name} ({(file.size / 1024).toFixed(2)} KB)
                                        </Typography>
                                        <IconButton
                                            onClick={clearFile}
                                            sx={{
                                                marginTop: '10px',
                                                backgroundColor: '#f0f0f0',
                                                '&:hover': {
                                                    backgroundColor: '#e0e0e0',
                                                },
                                            }}
                                        >
                                            <Clear />
                                        </IconButton>
                                    </>
                                ) : (
                                    <Typography variant="body1" sx={{ marginTop: '10px' }}>
                                        Drag & drop files here, or click to select files
                                    </Typography>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px',
                    }}
                >
                    <LoadingButton
                        disabled={!file}
                        sx={{
                            borderRadius: '50px',
                            padding: '6px 16px',
                        }}
                        variant="outlined"
                        color="primary"
                        type="submit"
                        loading={processing}
                        startIcon={<Upload />}
                    >
                        Upload
                    </LoadingButton>
                </DialogActions>
            </form>
        </GlassDialog>
    );
};

export default DailyWorkUploadForm;
