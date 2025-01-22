'use client'
import React from 'react'
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import InputField from '../InputField';
import Image from 'next/image';

const schema = z.object({
  username: z.string()
  .min(3, { message: 'Username must be atleast 3 character!' })
  .max(20, { message: 'Username must not exceed 20 character!' }),
  email: z.string().email({message : 'please enter a valid email address'}),
  password: z.string().min(3,{message : 'password must be atleast 8 characters'}),
  firstname : z.string().min(3, {message : 'firstname is required'}),
  lastname : z.string().min(3, {message : 'lastname is required'}),
  phonenumber : z.string().min(3, {message : 'phonenumber is required'}),
  address : z.string().min(3, {message : 'address is required'}),
  mode : z.string().min(3, {message : 'mode is required'}),
  birthday : z.string().min(3, {message : 'birthday is required'}),
  sex: z.enum(['male','female'], {message : 'select your gender'}),
  img:z.instanceof(File, {message : 'image is required'})
 

});
const StudentForm = ({type,data}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });
  const onSubmit = handleSubmit(data =>{
    console.log(data)
    // make API call here to save data to the server or database
  })

  return <form className='flex flex-col gap-4' onSubmit={onSubmit}>
    <h1 className='text-xl font-semibold'>Create a new Student</h1>
    <span className='text-xs text-purple-300 font-medium'>Authentication Information</span>
    <div className='flex flex-wrap justify-between gap-2'>
    <InputField 
    label ='Username'
    name = 'username'
    defaultValue={data?.username}
    register={register}
    error = {errors.username}/>

    <InputField 
    label ='Email'
    name = 'email'
    type='email'
    defaultValue={data?.email}
    register={register}
    error = {errors.email}/>

    <InputField 
    label ='Password'
    name = 'password'
    type='password'
    defaultValue={data?.password}
    register={register}
    error = {errors.password}/>

</div>

    <span className='text-xs text-purple-300 font-medium '>Personal Information</span>
    <div className='flex flex-wrap justify-between gap-2 '>

    <InputField 
    label ='First Name'
    name = 'firstname'
    defaultValue={data?.firstname}
    register={register}
    error = {errors.firstname}/>

    <InputField 
    label ='Last Name'
    name = 'lastname'
    type='text'
    defaultValue={data?.lastname}
    register={register}
    error = {errors.lastname}/>

    <InputField 
    label ='Phone Number'
    name = 'phonenumber'
    defaultValue={data?.phonenumber}
    register={register}
    error = {errors.phonenumber}/>

    <InputField 
    label ='Address'
    name = 'address'
    type='text'
    defaultValue={data?.address}
    register={register}
    error = {errors.address}/>


    <InputField 
    label ='Mode of Entry'
    name = 'mode'
    type='text'
    defaultValue={data?.mode}
    register={register}
    error = {errors.mode}/>

    <InputField 
    label ='Birthday'
    name = 'birthday'
    type = 'date'
    defaultValue={data?.birthday}
    register={register}
    error = {errors.birthday}/>


<div className="flex flex-col gap-2 w-full md:w-1/4">
      <label className="text-xs text-gray-500">Sex</label>
      <select
        type={type}
        {...register("sex")}
        className="ring-[1.5px] ring-gray-300 rounded-md p-2 text-sm"
        defaultValue={data?.sex}>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      {errors?.message && (
        <p className="text-red-400 text-xs">{errors?.message.toString()}</p>
      )}
    </div>

    <div className="flex flex-col gap-2 w-full md:w-1/4 justify-center">
      <label className="text-xs text-gray-500 flex items-center cursor-pointer gap-2" htmlFor='img'>
        <Image src ='/upload.png' alt='' width={28} height={28} />
        <span>Upload a Image</span>
        </label>
      <input
        type='file'
        id='img'
        {...register("img")}
        className="ring-[1.5px] ring-gray-300 rounded-md p-2 text-sm hidden"
        defaultValue={data?.img}/>
          
        
      {errors?.message && (
        <p className="text-red-400 text-xs">{errors?.message.toString()}</p>
      )}
    </div>
    </div>
    <button className='bg-purple-400 rounded-md text-white p-2'>{type === 'create' ? 'Create' : 'Update'}</button>
  </form>
}

export default StudentForm
