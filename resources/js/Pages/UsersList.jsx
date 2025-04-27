import React, {useState} from 'react';
import {Head, usePage} from "@inertiajs/react";
import {Box, CardContent, CardHeader, IconButton, useMediaQuery} from '@mui/material';
import {Button} from "@heroui/react";

import App from "@/Layouts/App.jsx";
import Grow from "@mui/material/Grow";
import GlassCard from "@/Components/GlassCard.jsx";
import {Add} from "@mui/icons-material";
import UsersTable from '@/Tables/UsersTable.jsx';
import AddUserForm from "@/Forms/AddUserForm.jsx";
import {useTheme} from "@mui/material/styles";

const UsersList = ({title, roles, departments, designations}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [openModalType, setOpenModalType] = useState(null);
    const [users, setUsers] = useState(usePage().props.allUsers);

    const openModal = (modalType) => {
        setOpenModalType(modalType);
    };

    const closeModal = () => {
        setOpenModalType(null);
    };
    return (
        <>
            <Head title={title}/>
            {openModalType === 'add' && (
                <AddUserForm
                    allUsers={users}
                    departments={departments}
                    designations={designations}
                    open={openModalType === 'add'}
                    setUsers={setUsers}
                    closeModal={closeModal}
                />
            )}
            {/*{openModalType === 'add' && (*/}
            {/*    <ProfileForm*/}
            {/*        user={user}*/}
            {/*        allUsers={allUsers}*/}
            {/*        departments={departments}*/}
            {/*        designations={designations}*/}
            {/*        open={openModalType === 'add'}*/}
            {/*        setUser={setUser}*/}
            {/*        closeModal={closeModal}*/}
            {/*    />*/}
            {/*)}*/}
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Grow in>
                    <GlassCard>
                        <CardHeader
                            title="Employees"
                            sx={{padding: '24px'}}
                            action={
                            <Box display="flex" gap={2}>
                                {isMobile ? (
                                    <>
                                        <Button
                                            isIconOnly
                                            title="Add Employee"
                                            variant="bordered"
                                            color="success"
                                            onClick={() => openModal('add')} // Handle opening the modal
                                        >
                                            <Add />
                                        </Button>
                                    </>

                                ) : (
                                    <>
                                        <Button
                                            title="Add Employee"
                                            variant="bordered"
                                            color="success"
                                            startContent={<Add />}
                                            onClick={() => openModal('add')} // Handle opening the modal
                                        >
                                            Add Employee
                                        </Button>
                                    </>
                                )}
                            </Box>
                        } />
                        <CardContent>
                            <UsersTable allUsers={users} roles={roles}/>

                        </CardContent>
                    </GlassCard>
                </Grow>
            </Box>
        </>

    );
};
UsersList.layout = (page) => <App>{page}</App>;
export default UsersList;
