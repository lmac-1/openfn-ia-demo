import type { ReactNode } from "react";
import type { CurrentProject } from "../../types/projects";
import { Breadcrumb, BreadcrumbPicker, Breadcrumbs } from "../Breadcrumbs";
import PickerButton from "./PickerButton";

interface Props {
  project: CurrentProject;
  /** The picker's label ("parent/child" for a sandbox). */
  label: string;
  /** Crumbs between the project and the page, e.g. [["History", "/projects/x/history"]]. */
  items?: [label: string, to: string][];
  /** The current page's crumb (not a link). */
  current?: ReactNode;
}

/** Breadcrumbs for a project page: the project picker, then the trail. */
export default function ProjectBreadcrumbs({ project, label, items = [], current }: Props) {
  return (
    <Breadcrumbs>
      <BreadcrumbPicker>
        <PickerButton
          label={label}
          isSandbox={project.parentId !== null}
          color={project.color}
        />
      </BreadcrumbPicker>
      {items.map(([label, to]) => (
        <Breadcrumb key={to} to={to}>
          {label}
        </Breadcrumb>
      ))}
      {current && <Breadcrumb>{current}</Breadcrumb>}
    </Breadcrumbs>
  );
}
