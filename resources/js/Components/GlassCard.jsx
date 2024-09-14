// import React, {forwardRef} from 'react';
// import { Fade} from '@mui/material';
// import {useTheme} from '@mui/material/styles';
// import {Card, CardHeader, CardBody, CardFooter} from "@nextui-org/react";
// const GlassCard = forwardRef(({ children, ...props }, ref) => {
//     const theme = useTheme();
//     return (
//         <Fade in>
//             <Card isBlurred
//                   className="border-none bg-background/60 dark:bg-default-100/50 max-w-[610px]"
//                   shadow="sm"
//                 // ref={ref}
//                 // {...props}
//                   // sx={{
//                 // <Card ref={ref} {...props} sx={{
//                 // height: '100%',
//                 // width: '100%',
//                 // display: 'flex',
//                 // flexDirection: 'column',
//                 // position: 'relative',
//                 // minWidth: '0px',
//                 // wordWrap: 'break-word',

//             {/*}}*/}
//             >
//                 {children}
//             </Card>
//         </Fade>
//
//     )
// });
//
// export default GlassCard;
import React, { forwardRef } from 'react';
import { Fade } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/react";

const GlassCard = forwardRef(({ children, header, footer, ...props }, ref) => {

    return (
            <Card
                isBlurred
                ref={ref}
                {...props}
                shadow="sm"
                css={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    minWidth: '0px',
                    wordWrap: 'break-word'
            }}
            >
                {/* Conditionally rendering header if provided */}
                {header && <CardHeader>{header}</CardHeader>}
                <CardBody>{children}</CardBody>
                {/* Conditionally rendering footer if provided */}
                {footer && <CardFooter>{footer}</CardFooter>}
            </Card>

    );
});

export default GlassCard;
