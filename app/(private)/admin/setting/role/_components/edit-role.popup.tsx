import permissionApiRequest from "@/apis/permission.api";
import roleApiRequest from "@/apis/role.api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/stores/auth-store.zustand";
import useLoadingStore from "@/stores/loading-store.zustand";
import {
  EyeIcon,
  EyeOffIcon,
  Save,
  TableProperties,
  UserPen,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const ACTION_COLORS: Record<string, string> = {
  read: "bg-blue-50 text-blue-700 border-blue-200",
  write: "bg-green-50 text-green-700 border-green-200",
  update: "bg-amber-50 text-amber-700 border-amber-200",
  delete: "bg-red-50 text-red-700 border-red-200",
};

const CATEGORY_COLORS: Record<string, string> = {
  OVERALL: "bg-violet-100 text-violet-800",
  SETTING: "bg-slate-100 text-slate-800",
  ME: "bg-cyan-100 text-cyan-800",
  PDM: "bg-orange-100 text-orange-800",
};

interface IPermision {
  id: number;
  name: string;
  resource: string;
  action: string;
  description: string;
  category: string;
}

interface IEditRolePopupProps {
  open: boolean;
  data: any;
  // Truyền vào mảng id hoặc name của permission đã có
  // Ví dụ: defaultPermissionIds={[1, 3, 5]} hoặc defaultPermissionNames={["user:read", "role:read"]}
  defaultPermissionIds?: number[];
  defaultPermissionNames?: string[];
  onOpenChange: (value: boolean, needRefresh: boolean) => void;
}

const EditRolePopup = ({
  open,
  data,
  defaultPermissionIds,
  defaultPermissionNames,
  onOpenChange,
}: IEditRolePopupProps) => {
  const router = useRouter();
  const { zStartLoading, zEndLoading } = useLoadingStore();
  const [showPassword, setShowPassword] = useState(false);
  const [dataEdit, setDataEdit] = useState<any>(data);
  const [permissions, setPermissions] = useState<IPermision[]>([]);
  const currentUserInfor = useCurrentUser();

  //🧨 Khởi tạo selected từ defaultPermissionIds hoặc defaultPermissionNames
  const [selected, setSelected] = useState<Set<number>>(() => {
    if (defaultPermissionIds?.length) {
      return new Set(defaultPermissionIds);
    }
    if (defaultPermissionNames?.length) {
      const ids = permissions
        .filter((p) => defaultPermissionNames.includes(p.name))
        .map((p) => p.id);
      return new Set(ids);
    }
    return new Set();
  });

  useEffect(() => {
    setDataEdit(data);

    const fetchGetAllPermission = async () => {
      try {
        const payload = await permissionApiRequest.sGetAll({});
        const permissionData = payload.payload;
        setPermissions(permissionData.data);

        /**
         * Lấy permission id from row data
         */
        let permsionId = [];
        for (let idx = 0; idx < data?.permissions.length; idx++) {
          const item = data?.permissions[idx];
          permsionId.push(item.id);
        }
        setSelected(new Set(permsionId));
      } catch (error) {
        console.error("[System] get All permission failed:", error);
      }
    };

    fetchGetAllPermission();
  }, [data]);

  // ✅ Reset selected khi data thay đổi (mở popup với role khác)
  useEffect(() => {
    if (defaultPermissionIds?.length) {
      setSelected(new Set(defaultPermissionIds));
    } else if (defaultPermissionNames?.length) {
      const ids = permissions
        .filter((p) => defaultPermissionNames.includes(p.name))
        .map((p) => p.id);
      setSelected(new Set(ids));
    } else {
      setSelected(new Set());
    }
  }, [data, defaultPermissionIds, defaultPermissionNames]);

  const onClickSubmitForm = async () => {
    try {
      zStartLoading();

      // ✅ Lấy danh sách permission đã chọn để submit
      console.log("selectedPermissions", selected);

      const parameter = {
        roleId: dataEdit["id"],
        permissionIds: [...selected],
        name: dataEdit["name"],
        description: dataEdit["description"],
      };
      let res = await roleApiRequest.sUpdateRole(parameter);

      console.log("res", res);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Update Fail");
    } finally {
      zEndLoading();
    }
  };

  // Group by category
  const grouped = permissions.reduce(
    (acc, p) => {
      if (!acc[p.category]) acc[p.category] = [];
      acc[p.category].push(p);
      return acc;
    },
    {} as Record<string, typeof permissions>,
  );

  const getCategoryState = (
    category: string,
  ): "all" | "none" | "indeterminate" => {
    const ids = grouped[category].map((p) => p.id);
    const checkedCount = ids.filter((id) => selected.has(id)).length;
    if (checkedCount === 0) return "none";
    if (checkedCount === ids.length) return "all";
    return "indeterminate";
  };

  const toggleCategory = (category: string) => {
    const ids = grouped[category].map((p) => p.id);
    const state = getCategoryState(category);
    setSelected((prev) => {
      const next = new Set(prev);
      if (state === "all") {
        ids.forEach((id) => next.delete(id));
      } else {
        ids.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const togglePermission = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={() => onOpenChange(false, false)}>
      <DialogContent
        className="max-w-full max-h-screen rounded-lg md:max-w-200 p-3"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="font-bold text-xl">
            <div className="flex gap-2 items-center">
              <div className="border rounded-md p-2 shadow-md shadow-sky-200">
                <TableProperties className="size-6" />
              </div>
              Role Edit
            </div>
          </DialogTitle>
          <DialogDescription className="hidden" />
        </DialogHeader>

        <Separator className="bg-black" />

        <div className="no-scrollbar -mx-4 max-h-[60vh] overflow-y-auto px-4 pb-4">
          {dataEdit && (
            <div className="p-1 overflow-y-auto max-h-[calc(100vh-200px)]">
              <div className="grid w-full items-center gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex flex-col space-y-1.5">
                    <Label>
                      Role Id<span className="text-red-600">(*)</span>
                    </Label>
                    <Input
                      disabled
                      defaultValue={dataEdit["id"]}
                      className="bg-slate-200 text-red-700 disabled:opacity-100 font-bold"
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label>Role Name</Label>
                    <Input
                      defaultValue={dataEdit["name"]}
                      onChange={(e) =>
                        setDataEdit((prev: any) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <Label>Description</Label>

                    <Textarea
                      placeholder="Type your message here."
                      defaultValue={dataEdit["description"]}
                      onChange={(e) =>
                        setDataEdit((prev: any) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Permissions */}
          <div className="px-1 space-y-3">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Permissions
              </h2>
              <p className="text-sm text-gray-500">
                {selected.size} of {permissions.length} permissions selected
              </p>
            </div>

            {Object.entries(grouped).map(([category, perms]) => {
              const state = getCategoryState(category);
              return (
                <div
                  key={category}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div
                    className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleCategory(category)}
                  >
                    <Checkbox
                      checked={state === "all"}
                      ref={(el) => {
                        if (el)
                          (el as any).indeterminate = state === "indeterminate";
                      }}
                      onCheckedChange={() => toggleCategory(category)}
                      onClick={(e) => e.stopPropagation()}
                      className="data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                    />
                    <span className="font-semibold text-sm text-gray-700 flex-1">
                      {category}
                    </span>
                    <Badge
                      className={cn(
                        "text-xs font-medium",
                        CATEGORY_COLORS[category] ??
                          "bg-gray-100 text-gray-700",
                      )}
                    >
                      {perms.filter((p) => selected.has(p.id)).length}/
                      {perms.length}
                    </Badge>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {perms.map((perm) => (
                      <label
                        key={perm.id}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div className="w-5" />
                        <Checkbox
                          checked={selected.has(perm.id)}
                          onCheckedChange={() => togglePermission(perm.id)}
                          className="data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-800">
                              {perm.description}
                            </span>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs capitalize",
                                ACTION_COLORS[perm.action] ??
                                  "bg-gray-50 text-gray-600",
                              )}
                            >
                              {perm.action}
                            </Badge>
                          </div>
                          <span className="text-xs text-gray-400">
                            {perm.name}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Separator className="bg-black" />

        <DialogFooter>
          <Button type="submit" onClick={onClickSubmitForm}>
            <Save />
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditRolePopup;
