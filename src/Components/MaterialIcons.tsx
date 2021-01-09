import React, {forwardRef} from 'react';
import { 
    // This is what the index.d says the type of the icons are, but it throws an error.
    // SvgIconComponent,
    Clear, SaveAlt, FilterList, FirstPage, LastPage, ChevronRight, 
    ChevronLeft, Search, ArrowDownward, DeleteOutlined, AddBox, Check, Edit, Remove, ViewColumn } from '@material-ui/icons';

export const MaterialIcons = {
    Add: forwardRef<any>(function AddWrapper(props, ref) { return <AddBox {...props} ref={ref} />; }),
    Check: forwardRef<any>(function CheckWrapper(props, ref) { return <Check {...props} ref={ref} />; }),
    Delete: forwardRef<any>(function DeleteWrapper(props, ref) { return <DeleteOutlined {...props} ref={ref} />; }),
    DetailPanel: forwardRef<any>(function DetailPanelWrapper(props, ref) { return <ChevronRight {...props} ref={ref} />; }),
    Edit: forwardRef<any>(function EditWrapper(props, ref) { return <Edit {...props} ref={ref} />; }),
    Clear: forwardRef<any>(function ClearWrapper(props, ref) { return <Clear {...props} ref={ref} />; }),
    Export: forwardRef<any>(function ExportWrapper(props, ref) { return <SaveAlt {...props} ref={ref} />; }),
    Filter: forwardRef<any>(function FilterWrapper(props, ref) { return <FilterList {...props} ref={ref} />; }),
    FirstPage: forwardRef<any>(function FirstPageWrapper(props, ref) { return <FirstPage {...props} ref={ref} />; }),
    LastPage: forwardRef<any>(function LastPageWrapper(props, ref) { return <LastPage {...props} ref={ref} />; }),
    NextPage: forwardRef<any>(function NextPageWrapper(props, ref) { return <ChevronRight {...props} ref={ref} />; }),
    PreviousPage: forwardRef<any>(function PreviousPageWrapper(props, ref) { return <ChevronLeft {...props} ref={ref} />; }),
    ResetSearch: forwardRef<any>(function ResetSearchWrapper(props, ref) { return <Clear {...props} ref={ref} />; }),
    Search: forwardRef<any>(function SearchWrapper(props, ref) { return <Search {...props} ref={ref} />; }),
    SortArrow: forwardRef<any>(function SortArrowWrapper(props, ref) { return <ArrowDownward {...props} ref={ref} />; }),
    ThirdStateCheck: forwardRef<any>(function ThirdStateCheckWrapper(props, ref) { return <Remove {...props} ref={ref} />; }),
    ViewColumn: forwardRef<any>(function ViewColumnWrapper(props, ref) { return <ViewColumn {...props} ref={ref} />; }),
};

export default MaterialIcons;