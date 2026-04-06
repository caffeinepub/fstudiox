import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Project {
    title: string;
    content: string;
    projectType: string;
    owner: Principal;
    createdAt: Time;
    updatedAt: Time;
}
export type Time = bigint;
export interface backendInterface {
    createProject(title: string, projectType: string, content: string): Promise<bigint>;
    deleteProject(id: bigint): Promise<void>;
    getProject(id: bigint): Promise<Project>;
    getProjects(): Promise<Array<Project>>;
    updateProject(id: bigint, title: string | null, content: string | null): Promise<void>;
}
