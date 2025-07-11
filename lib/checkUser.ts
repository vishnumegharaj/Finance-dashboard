import {currentUser} from "@clerk/nextjs/server";
import {db} from "./prisma";

export const checkUser = async() => {
  let user;
  try {
    user = await currentUser();
  } catch (error) {
    // If currentUser throws (e.g., not authenticated), treat as unauthenticated
    return null;
  }
  if (!user) {
    return null;
  }

  try{
    const loggedInUser = await db.user.findUnique({   
      where: {
        clerkUserId: user.id,
      },
    });

    if(loggedInUser){
        return loggedInUser;
    }

    const name = `${user.firstName} ${user.lastName}`;
    const newUser = await db.user.create({
        data: {
            clerkUserId: user.id,
            email: user.emailAddresses[0].emailAddress,
            name: name,
            imageUrl : user.imageUrl,
        },
    })

    return newUser;
  }catch(error){
    if (error instanceof Error) {
      console.error("Error checking user:", error.message);
    } else {
      console.error("Error checking user:", error);
    }
  }
}