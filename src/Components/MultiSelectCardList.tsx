import React from 'react';
import { List, Card, ButtonBase, CardContent, CardHeader, ListItem, ListSubheader } from '@material-ui/core';
import { Row, Col } from 'react-bootstrap';
import { AnimatePresence, motion } from 'framer-motion';

interface MultiSelectCardListProps {
    listItems: any[];
    onItemClick: ()=>void;
    title: string;
}

const variants = {
    visible: (custom: number) => ({
        opacity: 1,
        transition: { delay: custom * 0.2 }
    })
};

export const MultiSelectCardList: React.FC<MultiSelectCardListProps> = ({listItems, onItemClick, title}) => {
    return (
        <List>
            <ListSubheader><h3>{title}</h3></ListSubheader>
            <AnimatePresence>
                {
                    listItems.map(((unit: any, i: number) => (
                        <motion.div 
                            initial={{opacity: 0}}
                            animate='visible'
                            key={unit.id}
                            custom={i}
                            variants={variants}
                        >
                            <ListItem
                                button
                                selected={unit.selected}
                                onClick={onItemClick}
                                component={Card}
                                style={{margin: '1em', overflow: 'ellipses'}}
                            >
                                {unit.name}
                            </ListItem>
                        </motion.div>
                    )))
                }
            </AnimatePresence>
        </List>
        // <Row>
        //     <Col>
        //         {listItems.map(((unit: any, i: number) => (
        //             <ButtonBase key={unit.id} onClick={()=>{}}>
        //                 <Row>
        //                     <Col>
        //                         <Card>
        //                             <CardHeader title={`${unit.name}`} />
        //                             {/* <CardContent>Unit {i}</CardContent> */}
        //                         </Card>
        //                     </Col>
        //                 </Row>
        //             </ButtonBase>
        //         )))}
        //     </Col>
        // </Row>
    );
};

export default MultiSelectCardList;