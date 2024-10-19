import { Table, Column, Model, DataType, Index } from 'sequelize-typescript';

@Table({
  tableName: 'otps',
  createdAt: false,
  updatedAt: false,
})
export class OTP extends Model<OTP> {
  @Index({ unique: true })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  userID: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  otp: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  expiry: Date;
}
