import { Request, Response } from "express";
import { EventRepository } from "../repositories/event.repository";
import { AuthRequest } from "../middlewares/auth.middleware";

export class EventController {

  private eventRepo = new EventRepository();

  public createEvent = async (req: AuthRequest, res: Response) => {
    try {
      const { title, description, start_time, end_time } = req.body;

      let cover_image = '';
      if (req.file) {
        cover_image = req.file.path;
      }

      const event = await this.eventRepo.create({
        title,
        description,
        start_time,
        end_time,
        cover_image
      });

      return res.status(201).json({
        message: "Thêm mới sự kiện thành công",
        data: event
      })
    } catch (error: any) {
      if (error.message === "INVALID_START_TIME_PAST") {
        return res.status(401).json({ message: "Thời gian bắt đầu phải lớn hơn thời gian hiện tại" });
      } else if (error.message === "INVALID_TIME_RANGE") {
        return res.status(401).json({ message: "Thời gian kết thúc phải lớn hơn thời gian bắt đầu" });
      }
      console.log(error);
      return res.status(500).json({ message: "Lỗi nội bộ của server" });
    }
  }
}