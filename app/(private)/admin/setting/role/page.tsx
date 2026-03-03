"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import { reactFormatter } from "react-tabulator";
import "../../../../../public/css/test-tabulator/custom.css";
import Script from "next/script";
import roleApiRequest from "@/apis/role.api";
import EditRolePopup from "./_components/edit-role.popup";
import { useCurrentUser, useUserStore } from "@/stores/auth-store.zustand";
import { checkPermissionApply } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Pencil } from "lucide-react";
import AddRolePopup from "./_components/add-role.popup";

const PADDING_IN = 16;
export default function page() {
  const mainWrapperRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef(null);
  const [force, setForce] = useState<boolean>(false);
  const tableInstanceRef = useRef<any>(null);
  const currentUserInfor = useCurrentUser();

  const [tablePointScroll, setTablePointScroll] = useState<{
    x: number;
    y: number;
  } | null>({ x: 0, y: 0 }); //? Quản lý tọa độ

  const [mainFilter, setMainFilter] = useState<{ division: string }>({
    division: "HWA",
  });

  /**
   ** Data cho popup role
   */
  const [dataChoosedRole, setDataChoosedRole] = useState<any>();
  /**
   * State quản lý bật tắt popup edit role
   */
  const [openRoleEditDialog, setOpenRoleEditDialog] = useState<boolean>(false);
  /**
   * State quản lý bật tắt popup add role
   */
  const [openRoleAddDialog, setOpenRoleAddDialog] = useState<boolean>(false);

  //* React Tablutor
  const GenerateTablutorButton = (props: any) => {
    const rowData = props.cell._cell.row.data;
    const handleClickDelete = () => {
      // console.log(">>>rowData", rowData);
    };

    const handleClickEdit = () => {
      // console.log(">>>rowata", rowData);
      setDataChoosedRole(rowData);
      setOpenRoleEditDialog(true);
    };

    return (
      <>
        {checkPermissionApply(currentUserInfor, "role:update") && (
          <>
            <button
              className="ml-1 px-2 bg-green-500 rounded-sm cursor-pointer"
              onClick={() => handleClickEdit()}
            >
              Edit
            </button>
          </>
        )}

        {checkPermissionApply(currentUserInfor, "role:delete") && (
          <>
            <button
              className="ml-1 px-2 bg-red-500 rounded-sm cursor-pointer"
              onClick={() => handleClickDelete()}
            >
              Delete
            </button>
          </>
        )}
      </>
    );
  };
  let columns = [
    {
      title: "ROLENAME",
      field: "name",
      hozAlign: "left",
      width: 160,
      //* filter dạng select
      headerFilter: "list" as any,
      headerFilterParams: { valuesLookup: true, clearable: true } as any,
      //*
    },
    {
      title: "DESCRIPTION",
      field: "description",
      hozAlign: "left",
      width: 160,

      headerFilter: "input",
      // editor: "input",
      // editable: true,
    },
    {
      formatter: reactFormatter(<GenerateTablutorButton />),
      width: 150,
      hozAlign: "center",
    },
  ];

  const initializeTable = () => {
    // @ts-ignore
    if (tableRef.current && window.Tabulator) {
      const element = document.getElementById("grid_wrapper");
      const height =
        element && element.getBoundingClientRect().height - PADDING_IN * 2;

      console.log("current height", height);

      // @ts-ignore
      const table = new window.Tabulator(tableRef.current, {
        columns: columns,
        data: [],
        height: height,
        layout: "fitColumns",

        pagination: "local",
        paginationSize: 5,
        paginationSizeSelector: [1, 5, 10, 15, 20],

        // selectableRows: true,
      });

      table.on("headerTap", function (e: any, column: any) {
        console.log("headerTap", e, column);
      });

      // table.on("scrollVertical", function (top: any) {
      //   console.log("scroll", top);
      //   setTablePointScroll({ x: tablePointScroll?.x || 0, y: top });
      // });

      // table.on("scrollHorizontal", function (left: any) {
      //   console.log("scroll", left, tableInstanceRef.current);
      //   setTablePointScroll({ x: left, y: tablePointScroll?.y || 0 });
      // });
      tableInstanceRef.current = table;
    }
  };

  useEffect(() => {
    initializeTable();

    return () => {
      if (tableInstanceRef.current) {
        tableInstanceRef.current.destroy();
        tableInstanceRef.current = null;
      }
    };
  }, []);

  /**
   ** Call Api get all role
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        let parameter = {};

        const payload = await roleApiRequest.sGetAll(parameter); // placeholder
        const { data } = payload.payload;

        tableInstanceRef.current.replaceData(data);
      } catch (error) {
        console.error("error", error);
      } finally {
      }
    };

    fetchData();
  }, [force]);

  useEffect(() => {
    if (!mainWrapperRef.current) return; // Kiểm tra phần tử tồn tại

    // Khởi tạo ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const element = document.getElementById("grid_wrapper");
        const height =
          element && element.getBoundingClientRect().height - PADDING_IN * 2;

        console.log("current height", height);
        tableInstanceRef.current.setHeight(height);
      }
    });

    resizeObserver.observe(mainWrapperRef.current); // Bắt đầu theo dõi

    // Cleanup: Hủy observer khi component unmount hoặc ref thay đổi
    return () => {
      resizeObserver.disconnect();
    };
  }, []); // Chạy 1 lần khi mount

  useEffect(() => {
    console.log("updateUserInfor", currentUserInfor);
  }, [currentUserInfor]);

  return (
    <>
      <section className="h-full py-1 flex flex-col gap-2">
        <div className="h-25 w-full p-2 rounded-md shadow-md bg-white">
          <div className="overflow-x-scroll md:overflow-hidden w-[calc(100vw-2rem)] md:w-auto flex md:flex-wrap gap-2 pb-1">
            {checkPermissionApply(
              currentUserInfor,
              "role:search-main-filter",
            ) && (
              <>
                <div className="flex flex-row gap-1">
                  <Input
                    className="grow-0 w-fit"
                    value={mainFilter.division}
                    onChange={(e) =>
                      setMainFilter((prev) => ({
                        ...prev,
                        division: e.target.value,
                      }))
                    }
                  />
                  <Button onClick={() => setForce(!force)}>
                    Force Refresh
                  </Button>
                </div>
              </>
            )}
          </div>

          <Separator />

          <div className="overflow-x-scroll md:overflow-hidden w-[calc(100vw-2rem)] md:w-auto flex justify-end md:flex-wrap gap-2 py-1">
            <div>
              <Button className="" onClick={() => setOpenRoleAddDialog(true)}>
                <Pencil /> Add New Role
              </Button>
            </div>
          </div>
        </div>

        <div
          ref={mainWrapperRef}
          id="grid_wrapper"
          className="flex-1 p-4 rounded-md shadow-md bg-white"
        >
          <div ref={tableRef} className=""></div>
        </div>
      </section>

      {/* popup edit row */}
      {dataChoosedRole && (
        <EditRolePopup
          data={dataChoosedRole}
          open={openRoleEditDialog}
          onOpenChange={(value: boolean, needRefresh: boolean) => {
            setOpenRoleEditDialog(value);
            needRefresh && setForce((prev) => !prev);
          }}
        />
      )}

      <AddRolePopup
        open={openRoleAddDialog}
        onOpenChange={(value: boolean, needRefresh: boolean) => {
          setOpenRoleAddDialog(value);
          needRefresh && setForce((prev) => !prev);
        }}
      />
    </>
  );
}
