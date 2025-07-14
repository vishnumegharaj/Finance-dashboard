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
    // First try to find existing user with a more efficient query
    const loggedInUser = await db.user.findUnique({   
      where: {
        clerkUserId: user.id,
      },
      select: {
        id: true,
        clerkUserId: true,
        email: true,
        name: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if(loggedInUser){
        return loggedInUser;
    }

    // Only create new user if not found
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
    const newUser = await db.user.create({
        data: {
            clerkUserId: user.id,
            email: user.emailAddresses[0]?.emailAddress || '',
            name: name,
            imageUrl : user.imageUrl,
        },
        select: {
          id: true,
          clerkUserId: true,
          email: true,
          name: true,
          imageUrl: true,
          createdAt: true,
          updatedAt: true,
        }
    })

    return newUser;
  }catch(error){
    console.error("Error checking user:", error);
    return null;
  }
}