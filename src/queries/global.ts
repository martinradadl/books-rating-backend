import { PipelineStage } from "mongoose";

type RegexOption = "i" | "m" | "x" | "s" | "u";

export const REGEX_QUERY = ({
  regex,
  option,
  exact = false,
}: {
  regex: string;
  option?: RegexOption;
  exact?: boolean;
}) => ({
  $regex: exact ? `^${regex}$` : regex,
  ...(option && { $options: option }),
});

export const UNWIND_PRESERVE_NULL_AND_EMPTY_ARRAYS_QUERY = (path: string) => ({
  $unwind: {
    path,
    preserveNullAndEmptyArrays: true,
  },
});

export const COUNT_RESULTS_QUERY = [
  {
    $count: "count",
  },
];

export const SORT_BY_COUNT_DESCENDING_QUERY = {
  $sort: { count: -1 },
} as const;

export const GET_PIPELINE_STAGE_FROM_SUCCESSFUL_CONDITION = ({
  condition,
  pipelineStages,
}: {
  condition: boolean;
  pipelineStages: PipelineStage[];
}) => {
  return condition ? pipelineStages : [];
};
