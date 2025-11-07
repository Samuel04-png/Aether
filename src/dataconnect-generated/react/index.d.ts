import { CreateUserData, CreateUserVariables, GetProjectsForUserData, GetProjectsForUserVariables, CreateTaskData, CreateTaskVariables, ListTransactionsData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateUser(options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, CreateUserVariables>): UseDataConnectMutationResult<CreateUserData, CreateUserVariables>;
export function useCreateUser(dc: DataConnect, options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, CreateUserVariables>): UseDataConnectMutationResult<CreateUserData, CreateUserVariables>;

export function useGetProjectsForUser(vars: GetProjectsForUserVariables, options?: useDataConnectQueryOptions<GetProjectsForUserData>): UseDataConnectQueryResult<GetProjectsForUserData, GetProjectsForUserVariables>;
export function useGetProjectsForUser(dc: DataConnect, vars: GetProjectsForUserVariables, options?: useDataConnectQueryOptions<GetProjectsForUserData>): UseDataConnectQueryResult<GetProjectsForUserData, GetProjectsForUserVariables>;

export function useCreateTask(options?: useDataConnectMutationOptions<CreateTaskData, FirebaseError, CreateTaskVariables>): UseDataConnectMutationResult<CreateTaskData, CreateTaskVariables>;
export function useCreateTask(dc: DataConnect, options?: useDataConnectMutationOptions<CreateTaskData, FirebaseError, CreateTaskVariables>): UseDataConnectMutationResult<CreateTaskData, CreateTaskVariables>;

export function useListTransactions(options?: useDataConnectQueryOptions<ListTransactionsData>): UseDataConnectQueryResult<ListTransactionsData, undefined>;
export function useListTransactions(dc: DataConnect, options?: useDataConnectQueryOptions<ListTransactionsData>): UseDataConnectQueryResult<ListTransactionsData, undefined>;
