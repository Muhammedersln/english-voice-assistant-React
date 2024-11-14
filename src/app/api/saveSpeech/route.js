import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma"; // Prisma istemci yolunu kontrol edin

export async function POST(req) {
  try {
    const session = await getServerSession();

    if (!session) {
      console.log("Oturum açılmamış.");
      return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    const { transcribedText, aiResponse } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      console.log("Kullanıcı bulunamadı.");
      return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });
    }

    const newSpeech = await prisma.speech.create({
      data: {
        content: transcribedText,
        feedback: aiResponse,
        user: { connect: { id: user.id } },
      },
    });

    return new Response(JSON.stringify(newSpeech), { status: 200 });
  } catch (error) {
    console.error("Veri kaydetme hatası:", error);
    return new Response(JSON.stringify({ message: "Error saving speech data" }), { status: 500 });
  }
}
