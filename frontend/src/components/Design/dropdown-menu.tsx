import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "../../lib/utils";

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuContent = DropdownMenuPrimitive.Content;
const DropdownMenuItem = React.forwardRef<
  HTMLDivElement, // Ref type for HTML element
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> // Props type for DropdownMenuItem
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn("cursor-pointer p-2 hover:bg-gray-100", className || "")}

    {...props}
  >
    {children}
  </DropdownMenuPrimitive.Item>
));
DropdownMenuItem.displayName = "DropdownMenuItem";

const DropdownMenuLabel = React.forwardRef<
  HTMLDivElement, // Specify the ref type
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> // Properly type the props
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn("text-gray-700 font-semibold", className ?? "")}
    {...props}
  />
));
DropdownMenuLabel.displayName = "DropdownMenuLabel";


const DropdownMenuSeparator = DropdownMenuPrimitive.Separator;

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
};
