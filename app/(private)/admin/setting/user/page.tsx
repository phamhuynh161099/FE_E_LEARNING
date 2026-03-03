"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import { reactFormatter } from "react-tabulator";
import "../../../../../public/css/test-tabulator/custom.css";
import Script from "next/script";
import roleApiRequest from "@/apis/role.api";
// import EditRolePopup from "./_components/edit-role.popup";
import { useCurrentUser, useUserStore } from "@/stores/auth-store.zustand";
import { checkPermissionApply } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Pencil } from "lucide-react";
import userApiRequest from "@/apis/user.api";
import AddUserPopup from "./_components/add-user.popup";
import EditUserPopup from "./_components/edit-user.popup";
// import AddRolePopup from "./_components/add-role.popup";

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
   ** Data cho popup user
   */
  const [dataChoosedUser, setDataChoosedUser] = useState<any>();
  /**
   * State quản lý bật tắt popup edit user
   */
  const [openUserEditDialog, setOpenUserEditDialog] = useState<boolean>(false);
  /**
   * State quản lý bật tắt popup add user
   */
  const [openUserAddDialog, setOpenUserAddDialog] = useState<boolean>(false);

  //* React Tablutor
  const GenerateTablutorButton = (props: any) => {
    const rowData = props.cell._cell.row.data;
    const handleClickDelete = () => {
      // console.log(">>>rowData", rowData);
    };

    const handleClickEdit = () => {
      // console.log(">>>rowata", rowData);
      setDataChoosedUser(rowData);
      setOpenUserEditDialog(true);
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
      title: "USERNAME",
      field: "username",
      hozAlign: "left",
      width: 160,
      //* filter dạng select
      headerFilter: "list" as any,
      headerFilterParams: { valuesLookup: true, clearable: true } as any,
      //*
    },
    {
      title: "EMAIL",
      field: "email",
      hozAlign: "left",
      width: 160,

      headerFilter: "input",
      // editor: "input",
      // editable: true,
    },
    {
      title: "ROLE",
      field: "arrRole",
      hozAlign: "left",
      width: 160,

      headerFilter: "input",
      // editor: "input",
      // editable: true,
    },
    {
      title: "PERMISION",
      field: "arrPermission",
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

        const payload = await userApiRequest.sGetAllUser(parameter); // placeholder
        const { data } = payload.payload;

        // 🐱‍🏍 Pre handle data
        let handledData = [];
        for (let idx = 0; idx < data.length; idx++) {
          const item = data[idx];

          if (item.roles.length > 0) {
            let arrRoles:string[] = [];
            for (let idxRole = 0; idxRole < item.roles.length; idxRole++) {
              const role = item.roles[idxRole];
              arrRoles.push(role.name);
            }
            item["arrRole"] = arrRoles.join(",");
          }

          handledData.push(item);
        }
        // 🐱‍🏍 Pre handle data

        tableInstanceRef.current.replaceData(handledData);
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
              <Button className="" onClick={() => setOpenUserAddDialog(true)}>
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
      {dataChoosedUser && (
        <EditUserPopup
          data={dataChoosedUser}
          open={openUserEditDialog}
          onOpenChange={(value: boolean, needRefresh: boolean) => {
            setOpenUserEditDialog(value);
            needRefresh && setForce((prev) => !prev);
          }}
        />
      )}

      <AddUserPopup
        open={openUserAddDialog}
        onOpenChange={(value: boolean, needRefresh: boolean) => {
          setOpenUserAddDialog(value);
          needRefresh && setForce((prev) => !prev);
        }}
      />
    </>
  );
}
