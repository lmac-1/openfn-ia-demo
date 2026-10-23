import type { ReactNode } from "react";
import type { DataclipDetail } from "../../types/history";
import Card from "../Card";
import DateTime from "../DateTime";
import { DetailItem, DetailList } from "../DetailList";
import { EmptyState } from "../Table";
import DataclipTypePill from "./DataclipTypePill";

/** The "Dataclip Details" metadata card (dataclip_live/show.ex). */
export default function DataclipDetailsCard({ dataclip }: { dataclip: DataclipDetail }) {
  return (
    <Card title="Dataclip Details" padding="lg" className="mb-6">
      <DetailList layout="grid">
        <DetailItem label="ID" mono>
          {dataclip.id}
        </DetailItem>
        <DetailItem label="Type">
          <DataclipTypePill type={dataclip.type} />
        </DetailItem>
        <DetailItem label="Created">
          <DateTime value={dataclip.insertedAt} />
        </DetailItem>
        <DetailItem label="Updated">
          <DateTime value={dataclip.updatedAt} />
        </DetailItem>
        {dataclip.wipedAt && (
          <DetailItem label="Wiped">
            <DateTime value={dataclip.wipedAt} />
          </DetailItem>
        )}
      </DetailList>
    </Card>
  );
}

/** The dataclip page's body card: the JSON viewer, or "No Data Available". */
export function DataclipBodyCard({ wiped, children }: { wiped: boolean; children?: ReactNode }) {
  return (
    <Card padding="none" className="h-96 overflow-hidden">
      {wiped ? (
        <div className="flex h-full items-center">
          <EmptyState
            variant="plain"
            icon="hero-eye-slash"
            title="No Data Available"
            message="This dataclip's data has been wiped in accordance with the project's data retention policy."
          />
        </div>
      ) : (
        children
      )}
    </Card>
  );
}
