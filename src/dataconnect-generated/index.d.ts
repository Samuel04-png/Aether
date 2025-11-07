import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface Client_Key {
  id: UUIDString;
  __typename?: 'Client_Key';
}

export interface CreateTaskData {
  task_insert: Task_Key;
}

export interface CreateTaskVariables {
  projectId: UUIDString;
  name: string;
  description: string;
  dueDate: DateString;
  status: string;
}

export interface CreateUserData {
  user_insert: User_Key;
}

export interface CreateUserVariables {
  displayName: string;
  email: string;
}

export interface GetProjectsForUserData {
  projects: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    status: string;
  } & Project_Key)[];
}

export interface GetProjectsForUserVariables {
  userId: UUIDString;
}

export interface ListTransactionsData {
  transactions: ({
    id: UUIDString;
    amount: number;
    date: DateString;
    description: string;
    type: string;
    category?: string | null;
  } & Transaction_Key)[];
}

export interface Project_Key {
  id: UUIDString;
  __typename?: 'Project_Key';
}

export interface Task_Key {
  id: UUIDString;
  __typename?: 'Task_Key';
}

export interface Transaction_Key {
  id: UUIDString;
  __typename?: 'Transaction_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  operationName: string;
}
export const createUserRef: CreateUserRef;

export function createUser(vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;
export function createUser(dc: DataConnect, vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface GetProjectsForUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetProjectsForUserVariables): QueryRef<GetProjectsForUserData, GetProjectsForUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetProjectsForUserVariables): QueryRef<GetProjectsForUserData, GetProjectsForUserVariables>;
  operationName: string;
}
export const getProjectsForUserRef: GetProjectsForUserRef;

export function getProjectsForUser(vars: GetProjectsForUserVariables): QueryPromise<GetProjectsForUserData, GetProjectsForUserVariables>;
export function getProjectsForUser(dc: DataConnect, vars: GetProjectsForUserVariables): QueryPromise<GetProjectsForUserData, GetProjectsForUserVariables>;

interface CreateTaskRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateTaskVariables): MutationRef<CreateTaskData, CreateTaskVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateTaskVariables): MutationRef<CreateTaskData, CreateTaskVariables>;
  operationName: string;
}
export const createTaskRef: CreateTaskRef;

export function createTask(vars: CreateTaskVariables): MutationPromise<CreateTaskData, CreateTaskVariables>;
export function createTask(dc: DataConnect, vars: CreateTaskVariables): MutationPromise<CreateTaskData, CreateTaskVariables>;

interface ListTransactionsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListTransactionsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListTransactionsData, undefined>;
  operationName: string;
}
export const listTransactionsRef: ListTransactionsRef;

export function listTransactions(): QueryPromise<ListTransactionsData, undefined>;
export function listTransactions(dc: DataConnect): QueryPromise<ListTransactionsData, undefined>;

