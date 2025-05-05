import * as React from "react";
import {
  Root as RadixDialog,
  Trigger as DialogTrigger,
  Content as DialogContent,
} from "@radix-ui/react-dialog";
import { cn } from "../../lib/utils";


type DialogProps = React.ComponentProps<typeof RadixDialog>;

const Dialog: React.FC<DialogProps> = ({ children, ...props }) => {
  return <RadixDialog {...props}>{children}</RadixDialog>;
};


interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

const DialogHeader: React.FC<DialogHeaderProps> = ({
  children,
  className = "",
}) => {
  return <div className={cn("p-4 border-b", className)}>{children}</div>;
};


interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

const DialogTitle: React.FC<DialogTitleProps> = ({
  children,
  className = "",
}) => {
  return <h2 className={cn("text-lg font-semibold", className)}>{children}</h2>;
};

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
};
