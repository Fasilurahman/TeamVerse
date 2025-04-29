import cron from 'node-cron';
import { TaskRepository } from '../infrastructure/database/repositories/TaskRepository';
import { SprintRepository } from '../infrastructure/database/repositories/SprintRepository';
import { CheckSprintExpiryUseCase } from '../application/usecases/sprint/CheckSprintExpiryUseCase';


const sprintRepository = new SprintRepository();
const taskRepository = new TaskRepository();
const checkSprintExpiryUseCase = new CheckSprintExpiryUseCase(sprintRepository, taskRepository);


cron.schedule("0 * * * *", async () => {
    console.log("running a task every minute");
    await checkSprintExpiryUseCase.execute()
})