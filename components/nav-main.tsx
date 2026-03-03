// "use client"

// import { ChevronRight, type LucideIcon } from "lucide-react"

// import {
//   Collapsible,
//   CollapsibleContent,
//   CollapsibleTrigger,
// } from "@/components/ui/collapsible"
// import {
//   SidebarGroup,
//   SidebarGroupLabel,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   SidebarMenuSub,
//   SidebarMenuSubButton,
//   SidebarMenuSubItem,
// } from "@/components/ui/sidebar"

// export function NavMain({
//   items,
// }: {
//   items: {
//     title: string
//     url: string
//     icon?: LucideIcon
//     isActive?: boolean
//     items?: {
//       title: string
//       url: string
//     }[]
//   }[]
// }) {

//   return (
//     <SidebarGroup>
//       <SidebarGroupLabel className="border-r-0 bg-main-color-hsv text-white cursor-pointer">
//         <p>Platform</p>
//       </SidebarGroupLabel>
//       <SidebarMenu>
//         {items.map((item) => (
//           <Collapsible
//             key={item.title}
//             asChild
//             defaultOpen={item.isActive}
//             className="group/collapsible"
//           >
//             <SidebarMenuItem>
//               <CollapsibleTrigger asChild>
//                 <SidebarMenuButton tooltip={item.title}>
//                   {item.icon && <item.icon />}
//                   <span>{item.title}</span>
//                   <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
//                 </SidebarMenuButton>
//               </CollapsibleTrigger>
//               <CollapsibleContent>
//                 <SidebarMenuSub>
//                   {item.items?.map((subItem) => (
//                     <SidebarMenuSubItem key={subItem.title}>
//                       <SidebarMenuSubButton asChild>
//                         <a href={subItem.url}>
//                           <span>{subItem.title}</span>
//                         </a>
//                       </SidebarMenuSubButton>
//                     </SidebarMenuSubItem>
//                   ))}
//                 </SidebarMenuSub>
//               </CollapsibleContent>
//             </SidebarMenuItem>
//           </Collapsible>
//         ))}
//       </SidebarMenu>
//     </SidebarGroup>
//   )
// }
"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { ChevronRight, type LucideIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useCurrentUser } from "@/stores/auth-store.zustand";
import Link from "next/link";

export function NavMain({
  items,
  nameCategory,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    isDisplay?: boolean;
    items?: {
      title: string;
      url: string;
      isDisplay?: boolean;
      guard: string[];
    }[];
  }[];
  nameCategory: string;
}) {
  const [isDisplayNav, setIsDisplayNav] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const currentUserInfor = useCurrentUser();

  console.log(">>>currentUserInfor", currentUserInfor);

  useLayoutEffect(() => {
    let permission = [];
    if (currentUserInfor) {
      permission = currentUserInfor.permissions;
      console.log("permission", permission);
      // const hasOverlap = A.some(item => B.includes(item));

      let flagDisplayNav = false; // EX: OVERALL, ME, PDM
      for (let idxParent = 0; idxParent < items.length; idxParent++) {
        const iParent = items[idxParent];
        if (iParent.items) {
          for (let idxChild = 0; idxChild < iParent.items.length; idxChild++) {
            const iChild = iParent.items[idxChild];

            // check permission
            const checkUserHavePermission = permission.some((item) =>
              iChild.guard.includes(item),
            );

            if (checkUserHavePermission) {
              flagDisplayNav = true;
              iChild.isDisplay = true;
              iParent.isDisplay = true;
            }
          }
        }
      }

      if (flagDisplayNav) {
        setIsDisplayNav(true);
      } else {
        setIsDisplayNav(false);
      }

      console.log("nav", items);
    }

    return () => {};
  }, [currentUserInfor]);

  return (
    <>
      {isDisplayNav && (
        <>
          <SidebarGroup className="py-1">
            <SidebarGroupLabel
              className="border-r-0 bg-[#0090FF] text-white cursor-pointer"
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              <p className="text-sm">{nameCategory}</p>
              <ChevronRight
                className={`ml-auto transition-transform duration-200 ${isMenuOpen ? "rotate-90" : ""}`}
              />
            </SidebarGroupLabel>

            {isMenuOpen && (
              <SidebarMenu>
                {items.map(
                  (item) =>
                    item.isDisplay && (
                      <>
                        <Collapsible
                          key={item.title}
                          asChild
                          defaultOpen={item.isActive}
                          className="group/collapsible"
                        >
                          <SidebarMenuItem>
                            <CollapsibleTrigger asChild>
                              <SidebarMenuButton tooltip={item.title}>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                              </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <SidebarMenuSub>
                                {item.items?.map(
                                  (subItem) =>
                                    subItem.isDisplay && (
                                      <>
                                        <SidebarMenuSubItem key={subItem.title}>
                                          <SidebarMenuSubButton asChild>
                                            <Link
                                              href={subItem.url as string}
                                              className="font-semibold"
                                            >
                                              <span>{subItem.title}</span>
                                            </Link>
                                          </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                      </>
                                    ),
                                )}
                              </SidebarMenuSub>
                            </CollapsibleContent>
                          </SidebarMenuItem>
                        </Collapsible>
                      </>
                    ),
                )}
              </SidebarMenu>
            )}
          </SidebarGroup>
        </>
      )}
    </>
  );
}
