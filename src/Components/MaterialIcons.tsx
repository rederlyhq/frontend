/* eslint-disable react/display-name */
import React, {forwardRef} from 'react';
import { 
    Clear, SaveAlt, FilterList, FirstPage, LastPage, ChevronRight, 
    ChevronLeft, Search, ArrowDownward, DeleteOutlined, AddBox, Check, Edit, Remove, ViewColumn } from '@material-ui/icons';

export const MaterialIcons = {
    Add: forwardRef<any>((props, ref) => <AddBox {...props} ref={ref} />),
    Check: forwardRef<any>((props, ref) => <Check {...props} ref={ref} />),
    Delete: forwardRef<any>((props, ref) => <DeleteOutlined {...props} ref={ref} />),
    DetailPanel: forwardRef<any>((props, ref) => <ChevronRight {...props} ref={ref} />),
    Edit: forwardRef<any>((props, ref) => <Edit {...props} ref={ref} />),
    Clear: forwardRef<any>((props, ref) => <Clear {...props} ref={ref} />),
    Export: forwardRef<any>((props, ref) => <SaveAlt {...props} ref={ref} />),
    Filter: forwardRef<any>((props, ref) => <FilterList {...props} ref={ref} />),
    FirstPage: forwardRef<any>((props, ref) => <FirstPage {...props} ref={ref} />),
    LastPage: forwardRef<any>((props, ref) => <LastPage {...props} ref={ref} />),
    NextPage: forwardRef<any>((props, ref) => <ChevronRight {...props} ref={ref} />),
    PreviousPage: forwardRef<any>((props, ref) => <ChevronLeft {...props} ref={ref} />),
    ResetSearch: forwardRef<any>((props, ref) => <Clear {...props} ref={ref} />),
    Search: forwardRef<any>((props, ref) => <Search {...props} ref={ref} />),
    SortArrow: forwardRef<any>((props, ref) => <ArrowDownward {...props} ref={ref} />),
    ThirdStateCheck: forwardRef<any>((props, ref) => <Remove {...props} ref={ref} />),
    ViewColumn: forwardRef<any>((props, ref) => <ViewColumn {...props} ref={ref} />)
};

export default MaterialIcons;