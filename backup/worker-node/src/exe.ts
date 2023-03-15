import { WorkerNode } from "./worker-node";
import { adapt } from '@zimtsui/startable-adaptor';
import { $ } from "@zimtsui/startable";

adapt($(new WorkerNode()));
