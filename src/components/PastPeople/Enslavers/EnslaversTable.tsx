import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AgGridReact } from 'ag-grid-react';
import ENSLAVERS_TABLE from '@/utils/flatfiles/enslavers_table_cell_structure.json';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import CustomHeader from '../../FunctionComponents/CustomHeader';
import { generateRowsData } from '@/utils/functions/generateRowsData';
import {
  ColumnDef,
  StateRowData,
  TableCellStructureInitialStateProp,
  TableCellStructure,
} from '@/share/InterfaceTypesTable';
import { setColumnDefs, setRowData, setData } from '@/redux/getTableSlice';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import '@/style/table.scss';
import { useWindowSize } from '@react-hook/window-size';
import { Pagination, Skeleton, TablePagination } from '@mui/material';
import {
  AutoCompleteInitialState,
  CurrentPageInitialState,
  RangeSliderState,
  TYPESOFDATASET,
} from '@/share/InterfaceTypes';
import { setVisibleColumn } from '@/redux/getColumnSlice';
import { getRowsPerPage } from '@/utils/functions/getRowsPerPage';
import { ENSLAVERS_TABLE_FILE } from '@/share/CONST_DATA';
import { fetchEnslaversOptionsList } from '@/fetchAPI/pastEnslaversApi/fetchPastEnslaversOptionsList';
import ButtonDropdownSelectorEnslavers from './ColumnSelectorEnslaversTable/ButtonDropdownSelectorEnslavers';
import { generateColumnDef } from '@/utils/functions/generateColumnDef';

const EnslaversTable: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const tablesCell = ENSLAVERS_TABLE.cell_structure;
  const { columnDefs, data, rowData, loading } = useSelector(
    (state: RootState) => state.getTableData as StateRowData
  );
  const { rangeSliderMinMax: rang, varName } = useSelector(
    (state: RootState) => state.rangeSlider as RangeSliderState
  );
  const { autoCompleteValue, autoLabelName } = useSelector(
    (state: RootState) => state.autoCompleteList as AutoCompleteInitialState
  );
  const { currentPage } = useSelector(
    (state: RootState) => state.getScrollPage as CurrentPageInitialState
  );
  const { visibleColumnCells } = useSelector(
    (state: RootState) => state.getColumns as TableCellStructureInitialStateProp
  );

  const { dataSetKey, dataSetValue, dataSetValueBaseFilter, styleName } =
    useSelector((state: RootState) => state.getDataSetCollection);
  const [page, setPage] = useState<number>(0);
  const { currentEnslavedPage } = useSelector(
    (state: RootState) => state.getScrollEnslavedPage
  );
  const [rowsPerPage, setRowsPerPage] = useState(
    getRowsPerPage(window.innerWidth, window.innerHeight)
  );

  const [totalResultsCount, setTotalResultsCount] = useState(0);
  const gridRef = useRef<any>(null);

  const [width, height] = useWindowSize();
  const maxWidth =
    width > 1024
      ? width > 1440
        ? width * 0.88
        : width * 0.92
      : width === 1024
      ? width * 0.895
      : width === 768
      ? width * 0.95
      : width < 768
      ? width * 0.92
      : width * 0.75;
  const [style, setStyle] = useState({
    width: maxWidth,
    height: height * 0.62,
  });

  const containerStyle = useMemo(
    () => ({ width: maxWidth, height: height * 0.7 }),
    []
  );

  useEffect(() => {
    const handleResize = () => {
      setRowsPerPage(getRowsPerPage(window.innerWidth, window.innerHeight));
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    setStyle({
      width: maxWidth,
      height: height * 0.65,
    });
  }, [width, height, maxWidth]);
  const saveDataToLocalStorage = (
    data: Record<string, any>[],
    visibleColumnCells: string[]
  ) => {
    localStorage.setItem('data', JSON.stringify(data));
    localStorage.setItem(
      'visibleColumnCells',
      JSON.stringify(visibleColumnCells)
    );
  };

  useEffect(() => {
    saveDataToLocalStorage(data, visibleColumnCells);
  }, [data]);

  useEffect(() => {
    let subscribed = true;
    const fetchData = async () => {
      const newFormData: FormData = new FormData();
      newFormData.append('results_page', String(page + 1));
      newFormData.append('results_per_page', String(rowsPerPage));

      if (rang[varName] && currentEnslavedPage === 2) {
        newFormData.append(varName, String(rang[varName][0]));
        newFormData.append(varName, String(rang[varName][1]));
      }

      if (autoCompleteValue && varName) {
        for (let i = 0; i < autoLabelName.length; i++) {
          const label = autoLabelName[i];
          newFormData.append(varName, label);
        }
      }

      if (styleName !== TYPESOFDATASET.allVoyages) {
        for (const value of dataSetValue) {
          newFormData.append(dataSetKey, String(value));
        }
      }

      try {
        const response = await dispatch(
          fetchEnslaversOptionsList(newFormData)
        ).unwrap();
        if (subscribed) {
          setTotalResultsCount(Number(response.headers.total_results_count));

          dispatch(setData(response.data));
          saveDataToLocalStorage(response.data, visibleColumnCells);
        }
      } catch (error) {
        console.log('error', error);
      }
    };
    fetchData();
    return () => {
      subscribed = false;
    };
  }, [
    dispatch,
    rowsPerPage,
    page,
    currentEnslavedPage,
    currentPage,
    varName,
    rang,
    autoCompleteValue,
    autoLabelName,
    dataSetValue,
    dataSetKey,
    dataSetValueBaseFilter,
    styleName,
  ]);

  useEffect(() => {
    const visibleColumns = tablesCell
      .filter((cell) => cell.visible)
      .map((cell) => cell.colID);
    dispatch(setVisibleColumn(visibleColumns));
  }, [dispatch]);

  useEffect(() => {
    if (data.length > 0) {
      const finalRowData = generateRowsData(data, ENSLAVERS_TABLE_FILE);

      const newColumnDefs: ColumnDef[] = tablesCell.map(
        (value: TableCellStructure) =>
          generateColumnDef(value, visibleColumnCells)
      );
      dispatch(setColumnDefs(newColumnDefs));
      dispatch(setRowData(finalRowData as Record<string, any>[]));
    }
  }, [data, visibleColumnCells, dispatch]);

  const defaultColDef = useMemo(() => {
    return {
      sortable: true,
      resizable: true,
      filter: true,
      initialWidth: 200,
      wrapHeaderText: true,
      autoHeaderHeight: true,
    };
  }, []);

  const components = useMemo(() => {
    return {
      agColumnHeader: CustomHeader,
    };
  }, []);

  const getRowRowStyle = () => {
    return {
      fontSize: 13,
      fontWeight: 500,
      color: '#000',
      fontFamily: `Roboto`,
      paddingLeft: '20px',
    };
  };

  const handleColumnVisibleChange = (params: any) => {
    const { columnApi } = params;
    const allColumns = columnApi.getAllColumns();
    const visibleColumns = allColumns
      .filter((column: any) => column.isVisible())
      .map((column: any) => column.getColId());

    dispatch(setVisibleColumn(visibleColumns));
  };
  const gridOptions = useMemo(
    () => ({
      headerHeight: 40,
      suppressHorizontalScroll: true,
      onGridReady: (params: any) => {
        const { columnApi } = params;
        columnApi.autoSizeColumns();
      },
    }),
    []
  );

  const handleChangePage = useCallback(
    (event: any, newPage: number) => {
      setPage(newPage);
    },
    [page]
  );

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setRowsPerPage(parseInt(event.target.value));
      setPage(0);
    },
    [page, rowsPerPage]
  );

  const handleChangePagePagination = useCallback(
    (event: any, newPage: number) => {
      setPage(newPage - 1);
    },
    [page]
  );

  return (
    <div>
      {loading ? (
        <div className="Skeleton-loading">
          <Skeleton />
          <Skeleton animation="wave" />
          <Skeleton animation={false} />
        </div>
      ) : (
        <div style={containerStyle} className="ag-theme-alpine grid-container">
          <div style={style}>
            <span className="tableContainer">
              <ButtonDropdownSelectorEnslavers />
              <TablePagination
                component="div"
                count={totalResultsCount}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPageOptions={[5, 10, 12, 15, 20, 25, 30, 45, 50, 100]}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </span>

            <AgGridReact
              ref={gridRef}
              rowData={rowData}
              onColumnVisible={handleColumnVisibleChange}
              gridOptions={gridOptions}
              columnDefs={columnDefs}
              suppressMenuHide={true}
              animateRows={true}
              paginationPageSize={rowsPerPage}
              defaultColDef={defaultColDef}
              components={components}
              getRowStyle={getRowRowStyle}
              enableBrowserTooltips={true}
              tooltipShowDelay={0}
              tooltipHideDelay={1000}
            />
            <div className="pagination-div">
              <Pagination
                color="primary"
                count={Math.ceil(totalResultsCount / rowsPerPage)}
                page={page + 1}
                onChange={handleChangePagePagination}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnslaversTable;