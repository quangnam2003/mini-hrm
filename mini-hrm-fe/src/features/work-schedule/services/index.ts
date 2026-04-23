import api from "@/lib/axios";
import {
  CreateWorkSchedulePayload,
  RuleWorkSetting,
  UpdateWorkSchedulePayload,
} from "../types";

export const getRuleWorkSettings = async (): Promise<RuleWorkSetting[]> => {
  const res = await api.get("/rule-work-settings");
  return res.data.data;
};

export const createRuleWorkSetting = async (
  data: CreateWorkSchedulePayload,
): Promise<RuleWorkSetting> => {
  const res = await api.post("/rule-work-settings", data);
  console.log("_______________", res.data);
  console.log("_______________", res.data.data);
  return res.data.data;
};

export const updateRuleWorkSetting = async (
  data: UpdateWorkSchedulePayload,
): Promise<RuleWorkSetting> => {
  const { id, ...rest } = data;
  const res = await api.put(`/rule-work-settings/${id}`, rest);

  return res.data.data;
};

export const deleteRuleWorkSetting = async (id: number): Promise<void> => {
  await api.delete(`/rule-work-settings/${id}`);
};

export const setActiveRuleWorkSetting = async (id: number): Promise<void> => {
  await api.post(`/rule-work-settings/${id}/set-active`);
};
