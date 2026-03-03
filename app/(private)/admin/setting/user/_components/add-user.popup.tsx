import permissionApiRequest from "@/apis/permission.api";
import roleApiRequest from "@/apis/role.api";
import userApiRequest from "@/apis/user.api";
import { MultiSelect } from "@/components/multi-select";
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

interface IPermision {
  id: number;
  name: string;
  resource: string;
  action: string;
  description: string;
  category: string;
}

interface IAddRolePopupProps {
  open: boolean;
  onOpenChange: (value: boolean, needRefresh: boolean) => void;
}

const options = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue.js" },
  { value: "angular", label: "Angular" },
  { value: "java", label: "Java" },
];

const AddUserPopup = ({ open, onOpenChange }: IAddRolePopupProps) => {
  const router = useRouter();
  const { zStartLoading, zEndLoading } = useLoadingStore();
  const [showPassword, setShowPassword] = useState(false);
  const [dataAdd, setDataAdd] = useState<any>({
    roleId: "",
    permissionIds: [],
    name: "",
    description: [],
  });
  const [roleOption, setRoleOption] = useState<
    {
      value: string;
      label: string;
    }[]
  >([]);
  const currentUserInfor = useCurrentUser();

  //🧨
  const [selectedRole, setSelectedRole] = useState<string[]>([]);

  useEffect(() => {
    const fetchGetAllRole = async () => {
      try {
        const payload = await roleApiRequest.sGetAll({});
        const { data } = payload.payload;

        console.log("Role", data);
        let _roleOption = [];
        for (let idx = 0; idx < data.length; idx++) {
          const item = data[idx];
          _roleOption.push({
            value: item.id,
            label: item.name,
          });
        }

        setRoleOption(_roleOption);
        // setSelected(new Set());
      } catch (error) {
        console.error("[System] get All role failed:", error);
      }
    };

    fetchGetAllRole();
  }, []);

  const onClickSubmitForm = async () => {
    try {
      zStartLoading();
      const parameter = {
        username: dataAdd["username"],
        password: dataAdd["password"],
        email: dataAdd["email"],
        roleIDs: selectedRole,
      };
      let res = await userApiRequest.sAddNewUser(parameter);

      console.log("res", res);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Update Fail");
    } finally {
      zEndLoading();
    }
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
              User Add
            </div>
          </DialogTitle>
          <DialogDescription className="hidden" />
        </DialogHeader>

        <Separator className="bg-black" />

        <div className="no-scrollbar -mx-4 max-h-[60vh] overflow-y-auto px-4 pb-4">
          {dataAdd && (
            <div className="p-1 overflow-y-auto max-h-[calc(100vh-200px)]">
              <div className="grid w-full items-center gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex flex-col space-y-1.5">
                    <Label>Username</Label>
                    <Input
                      defaultValue={dataAdd["username"]}
                      onChange={(e) =>
                        setDataAdd((prev: any) => ({
                          ...prev,
                          username: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <Label>Password</Label>
                    {/* Custom input type password have buton show/hide  */}
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        className={cn("hide-password-toggle pr-10")}
                        onChange={(e) =>
                          setDataAdd((prev: any) => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? (
                          <EyeIcon className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <EyeOffIcon className="h-4 w-4" aria-hidden="true" />
                        )}
                        <span className="sr-only">
                          {showPassword ? "Hide password" : "Show password"}
                        </span>
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <Label>Email</Label>
                    <Input
                    className="h-10"
                      defaultValue={dataAdd["email"]}
                      onChange={(e) =>
                        setDataAdd((prev: any) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <Label>Role</Label>
                    <MultiSelect
                      onValueChange={(value: any) => {
                        setSelectedRole(value);
                      }}
                      defaultValue={selectedRole}
                      options={roleOption}
                      placeholder="Select Role..."
                      variant="default"
                      animationConfig={{
                        badgeAnimation: "bounce",
                        popoverAnimation: "scale",
                        optionHoverAnimation: "glow",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
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

export default AddUserPopup;
