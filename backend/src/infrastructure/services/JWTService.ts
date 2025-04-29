import jwt from 'jsonwebtoken'

export class JWTService{
    private secretKey = process.env.JWT_SECRET || 'Nothing'

    generateToken(userId: string, role: string):string{
        console.log('22222');
        
        return jwt.sign({userId,role},this.secretKey,{expiresIn:'1h'});  
    }
    verifyToken(token: string):any{
        return jwt.verify(token,this.secretKey)
    }
}