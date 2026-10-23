import Header from "../../components/Header";
import { Centered, PageContent } from "../../components/PageContent";
import ProjectBreadcrumbs from "../../components/shell/ProjectBreadcrumbs";
import DataclipDetailsCard, { DataclipBodyCard } from "../../components/history/DataclipDetailsCard";
import JsonViewer from "../../components/history/JsonViewer";
import type { DataclipDetail } from "../../types/history";
import type { CurrentProject } from "../../types/projects";
import { shortUuid } from "../../utils/format";

export interface DataclipShowPageProps {
  project: CurrentProject;
  projectLabel: string;
  dataclip: DataclipDetail;
  /** The body, pretty-printed; undefined while the host fetches it. Never shown for a wiped dataclip. */
  body: string | undefined;
}

/** Inventory view `dataclip-show` (DataclipLive.Show, dataclip_live/show.ex). */
export default function DataclipShowPage({ project, projectLabel, dataclip, body }: DataclipShowPageProps) {
  return (
    <PageContent
      header={
        <Header
          breadcrumbs={
            <ProjectBreadcrumbs
              project={project}
              label={projectLabel}
              current={
                <>
                  Dataclip
                  <span className="pl-2 font-light">{shortUuid(dataclip.id)}</span>
                </>
              }
            />
          }
        />
      }
    >
      <Centered>
        <DataclipDetailsCard dataclip={dataclip} />
        <DataclipBodyCard wiped={dataclip.wipedAt !== null}>
          <JsonViewer value={body ?? ""} />
        </DataclipBodyCard>
      </Centered>
    </PageContent>
  );
}
