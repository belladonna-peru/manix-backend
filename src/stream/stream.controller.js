import { startStream, endStream, getLiveStreams, getStreamerStats, createEvent, getMyEvents, deleteEvent } from "./stream.service.js";

export const start = async (req, res) => {
  try {
    const stream = await startStream({ userId: req.user.id, ...req.body });
    if (req.io) {
      req.io.emit("stream:live", { stream, userId: req.user.id });
      req.io.emit("presence:update", { userId: req.user.id, isOnline: true, isStreaming: true, streamTitle: req.body.title });
    }
    res.status(201).json(stream);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

export const end = async (req, res) => {
  try {
    const stream = await endStream(req.user.id);
    if (req.io) {
      req.io.emit("stream:ended", { userId: req.user.id });
      req.io.emit("presence:update", { userId: req.user.id, isOnline: true, isStreaming: false });
    }
    res.json(stream);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

export const live = async (req, res) => {
  try {
    const streams = await getLiveStreams();
    res.json(streams);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const stats = async (req, res) => {
  try {
    const data = await getStreamerStats(req.user.id);
    res.json(data);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const addEvent = async (req, res) => {
  try {
    const event = await createEvent({ userId: req.user.id, ...req.body });
    res.status(201).json(event);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

export const myEvents = async (req, res) => {
  try {
    const events = await getMyEvents(req.user.id);
    res.json(events);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const removeEvent = async (req, res) => {
  try {
    await deleteEvent({ eventId: req.params.id, userId: req.user.id });
    res.json({ message: "Evento eliminado" });
  } catch (error) { res.status(400).json({ message: error.message }); }
};
