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
  Upload,
  UserPen,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from "@/components/ui/file-upload";
import videoApiRequest from "@/apis/video.api";
import { EncodeProgressCard } from "./encode-progress-card";

interface IPermision {
  id: number;
  name: string;
  resource: string;
  action: string;
  description: string;
  category: string;
}

interface IAddVideoPopupProps {
  open: boolean;
  data: any;
  onOpenChange: (value: boolean, needRefresh: boolean) => void;
}

const TrackingVideoPopup = ({
  open,
  onOpenChange,
  data,
}: IAddVideoPopupProps) => {
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
              Tracking Video
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
                    <EncodeProgressCard
                      jobId={data["jobId"]}
                      onCompleted={() => console.log("Encode xong!")}
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

export default TrackingVideoPopup;
